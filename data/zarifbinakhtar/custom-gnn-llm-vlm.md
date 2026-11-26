# zarifbinakhtar/custom-GNN-LLM-VLM

## Resumen

Custom GNN–LLM–VLM es un repositorio de artefactos de investigación publicado por zarifbinakhtar en Hugging Face, no un modelo fundacional al uso. Contiene checkpoints, ficheros de configuración, topologías de grafo (vuelos `h1`–`h5` y pares fusionados `h1_h2`–`h1_h5`), figuras de diagnóstico y scripts auxiliares de carga para un framework de doctorado conjunto denominado Custom GNN–LLM–VLM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los artefactos pesados aún no se han subido o que el repositorio está en fase inicial.

El núcleo técnico descrito en la model card es un pipeline de tres etapas: (1) una GNN física-informada (PI-GNN) de dos capas `GCNConv` entrenada con una penalización de no negatividad (`lambda = 0.1`) sobre matrices de nodos y aristas para aprender representaciones de trayectoria y maniobra en vuelos de UAV; (2) un proyector de soft-tokens (`SpatialGraphProjector` / `MATLABGraphProjector`) que mapea los embeddings del grafo a tokens de prompt con forma `[batch, num_tokens, llm_dim]`, pensados para concatenarse a los embeddings de un LLM/VLM como `Qwen/Qwen2.5-7B-Instruct` (hidden size 3584); y (3) una integración de telemetría de borde con cámara Luxonis OAK-1, detección YOLO y seguimiento de trayectoria sobre UDP en `127.0.0.1:5005`.

Su relevancia es acotada: se trata de material de investigación académica para alineamiento grafo-a-LLM/VLM y diagnóstico de telemetría UAV en tiempo real, no de un modelo listo para producción. No se publican parámetros totales, contexto, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: GNN física-informada (2 capas `GCNConv`) + proyector de soft-tokens grafo-a-LLM/VLM + backbone LLM/VLM externo (p. ej. Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone LLM/VLM objetivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`); grafos en CSV (`intra_nodes_*.csv`, `omegaintra_edges_*.csv`); configuración en YAML (`pipeline.yaml`) |

## Arquitectura y entrenamiento

La componente GNN es una red de dos capas `GCNConv` (PyTorch Geometric) que opera sobre matrices de nodos intra-vuelo (`intra_nodes_*.csv`) y ficheros de aristas (`omegaintra_edges_*.csv`). Se entrena con una penalización física de no negatividad con `lambda = 0.1`, orientada a preservar coherencia física en las representaciones aprendidas de trayectorias y maniobras. El entrenamiento cubre vuelos individuales `h1`–`h5` y pares fusionados `h1_h2`, `h1_h3`, `h1_h4` y `h1_h5`, de modo que el modelo aprende una representación unificada entre vuelos.

La conexión con el LLM/VLM se realiza mediante un proyector de soft-tokens (`SpatialGraphProjector` o `MATLABGraphProjector`) que transforma los embeddings del grafo en tokens de prompt de dimensión `llm_dim` y los antepone a los embeddings de prompt del backbone. La dimensión `llm_dim` debe coincidir con el hidden size del backbone (3584 para Qwen2.5-7B-Instruct). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF/DPO. La integración de borde se apoya en cámara Luxonis OAK-1, detección YOLO y seguimiento de trayectoria sobre UDP.

## Capacidades

- Representación de grafos de telemetría UAV: aprendizaje de trayectorias y maniobras sobre vuelos `h1`–`h5` y pares fusionados.
- Proyección grafo-a-LLM/VLM: generación de soft-tokens (`[batch, num_tokens, llm_dim]`) para condicionar un backbone lingüístico o multimodal.
- Razonamiento diagnóstico multimodal: la model card menciona razonamiento diagnóstico de lenguaje/multimodal usando el backbone (p. ej. Qwen2.5-7B-Instruct).
- Integración con streams de telemetría de borde: cámara OAK-1, detección YOLO y seguimiento de trayectoria sobre UDP en `127.0.0.1:5005`.
- Carga de artefactos vía `huggingface_hub` (`hf_hub_download`) para checkpoints y configuración.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa; depende del backbone.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión indirecta vía backbone VLM y stream de cámara; no se detallan más.

## Casos de uso

- Investigación en representación de grafos física-informada: usar el checkpoint `pi_gnn_fusion.pt` y los CSV de grafos para reproducir experimentos de aprendizaje de trayectorias y maniobras en vuelos `h1`–`h5`.
- Alineamiento grafo-a-LLM en laboratorio: emplear `SpatialGraphProjector` para inyectar embeddings de grafo como soft-tokens en un backbone como Qwen2.5-7B-Instruct y evaluar la calidad del condicionamiento.
- Diagnóstico de telemetría UAV en tiempo real: conectar el pipeline al stream UDP (`127.0.0.1:5005`) con cámara OAK-1 y YOLO para generar diagnósticos asistidos por LLM/VLM.
- Estudio de fusión de vuelos: entrenar y evaluar sobre pares fusionados (`h1_h2`–`h1_h5`) para analizar generalización entre vuelos.
- Prototipado de edge AI: desplegar la GNN y el proyector en entornos de borde junto a la captura de cámara, aprovechando que la GNN es ligera (dos capas `GCNConv`).
- Docencia y tesis doctoral: reutilizar los scripts `load_artifacts.py` y `pipeline.yaml` como base reproducible para trabajos de alineamiento grafo-LLM.
- Benchmarking de proyectores: comparar `SpatialGraphProjector` frente a `MATLABGraphProjector` en tareas de razonamiento diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el conjunto; la GNN de dos capas `GCNConv` es ligera, pero el backbone LLM/VLM (p. ej. Qwen2.5-7B-Instruct) domina el consumo y requiere hardware acorde a su tamaño y cuantización.
- GPU recomendadas: no disponible en la información; para el backbone de 7B se asume hardware de gama alta (A100/H100 o RTX 4090), pero no se confirma en la model card.
- ¿Cabe en GPU consumer?: la GNN y el proyector sí; el backbone de 7B depende de la cuantización, dato no disponible.
- Opciones de despliegue: carga vía `huggingface_hub` y PyTorch; no se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (pipeline GNN–LLM–VLM para telemetría UAV) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Repositorio de investigación: 0 descargas, 0 likes y tamaño de 0.0 GB; los checkpoints pueden no estar publicados o estar incompletos.
- Sin licencia declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Sin idiomas declarados: no se garantiza cobertura multilingüe.
- Acoplamiento dimensional estricto: `llm_dim` del proyector debe coincidir con el hidden size del backbone (3584 para Qwen2.5-7B-Instruct); los CSV de grafos deben coincidir con las dimensiones de features de nodo esperadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni comparaciones.
- Riesgo de alucinación: heredado del backbone LLM/VLM empleado, no evaluado en la model card.
- Sesgos: no documentados.
- Dependencia de infraestructura específica (OAK-1, UDP `127.0.0.1:5005`, YOLO) que limita la portabilidad.
- Uso previsto exclusivamente académico y de investigación doctoral según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/zarifbinakhtar/custom-GNN-LLM-VLM
- Perfil del autor en Hugging Face: https://huggingface.co/zarifbinakhtar
- Repositorio GitHub (código y arquitectura): https://github.com/Akhtar-Zarif/custom-GNN-LLM-VLM
- Backbone de referencia mencionado: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
