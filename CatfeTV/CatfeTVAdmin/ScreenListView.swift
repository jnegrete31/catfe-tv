//
//  ScreenListView.swift
//  CatfeTVAdmin
//
//  Screen list with drag-and-drop reordering
//

import SwiftUI

struct ScreenListView: View {
    @EnvironmentObject var apiClient: APIClient
    @State private var showingAddScreen = false
    @State private var editingScreen: Screen?
    @State private var showingDeleteAlert = false
    @State private var screenToDelete: Screen?
    
    var body: some View {
        List {
            // Active Screens Section
            Section {
                ForEach(apiClient.screens.filter { $0.isActive }) { screen in
                    ScreenRowView(screen: screen)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            editingScreen = screen
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            Button(role: .destructive) {
                                screenToDelete = screen
                                showingDeleteAlert = true
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                            
                            Button {
                                toggleActive(screen)
                            } label: {
                                Label("Deactivate", systemImage: "eye.slash")
                            }
                            .tint(.orange)
                        }
                }
                .onMove(perform: moveScreens)
            } header: {
                HStack {
                    Text("Active Screens")
                    Spacer()
                    Text("\(apiClient.screens.filter { $0.isActive }.count)")
                        .foregroundColor(.secondary)
                }
            }
            
            // Inactive Screens Section
            if apiClient.screens.contains(where: { !$0.isActive }) {
                Section {
                    ForEach(apiClient.screens.filter { !$0.isActive }) { screen in
                        ScreenRowView(screen: screen, isInactive: true)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                editingScreen = screen
                            }
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                Button(role: .destructive) {
                                    screenToDelete = screen
                                    showingDeleteAlert = true
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                                
                                Button {
                                    toggleActive(screen)
                                } label: {
                                    Label("Activate", systemImage: "eye")
                                }
                                .tint(.green)
                            }
                    }
                } header: {
                    Text("Inactive Screens")
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Screens")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showingAddScreen = true
                } label: {
                    Image(systemName: "plus")
                }
            }
            
            ToolbarItem(placement: .navigationBarLeading) {
                EditButton()
            }
        }
        .refreshable {
            await apiClient.fetchScreens()
        }
        .sheet(isPresented: $showingAddScreen) {
            NavigationStack {
                ScreenEditorView(screen: nil)
            }
        }
        .sheet(item: $editingScreen) { screen in
            NavigationStack {
                ScreenEditorView(screen: screen)
            }
        }
        .alert("Delete Screen", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                if let screen = screenToDelete {
                    deleteScreen(screen)
                }
            }
        } message: {
            Text("Are you sure you want to delete this screen? This action cannot be undone.")
        }
    }
    
    // MARK: - Actions
    
    private func moveScreens(from source: IndexSet, to destination: Int) {
        var activeScreens = apiClient.screens.filter { $0.isActive }
        activeScreens.move(fromOffsets: source, toOffset: destination)
        
        // Update sort order
        for (index, var screen) in activeScreens.enumerated() {
            screen.sortOrder = index
        }
        
        Task {
            try? await apiClient.reorderScreens(activeScreens)
            HapticFeedback.medium()
        }
    }
    
    private func toggleActive(_ screen: Screen) {
        var updatedScreen = screen
        updatedScreen.isActive.toggle()
        
        Task {
            try? await apiClient.updateScreen(updatedScreen)
            HapticFeedback.light()
        }
    }
    
    private func deleteScreen(_ screen: Screen) {
        Task {
            try? await apiClient.deleteScreen(screen)
            HapticFeedback.success()
        }
    }
}

// MARK: - Screen Row View

struct ScreenRowView: View {
    let screen: Screen
    var isInactive: Bool = false
    
    var body: some View {
        HStack(spacing: 16) {
            // Type Icon
            ZStack {
                Circle()
                    .fill(screen.type.accentColor.opacity(isInactive ? 0.3 : 0.15))
                    .frame(width: 44, height: 44)
                
                Image(systemName: screen.type.icon)
                    .font(.system(size: 18))
                    .foregroundColor(screen.type.accentColor.opacity(isInactive ? 0.5 : 1))
            }
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(screen.title)
                    .font(.headline)
                    .foregroundColor(isInactive ? .secondary : .primary)
                    .lineLimit(1)
                
                HStack(spacing: 8) {
                    Text(screen.type.displayName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .foregroundColor(.secondary)
                    
                    Text("\(screen.duration)s")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if screen.schedule != nil {
                        Image(systemName: "clock")
                            .font(.caption)
                            .foregroundColor(.catfeTerracotta)
                    }
                }
            }
            
            Spacer()
            
            // Thumbnail
            if let imageURL = screen.imageURL, let url = URL(string: imageURL) {
                CachedAsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                }
                .frame(width: 60, height: 40)
                .cornerRadius(6)
                .opacity(isInactive ? 0.5 : 1)
            }
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Preview

#if DEBUG
struct ScreenListView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            ScreenListView()
                .environmentObject(APIClient.shared)
        }
    }
}
#endif
