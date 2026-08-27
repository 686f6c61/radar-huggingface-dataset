# TheDrummer/Orion-26B-A4B-v1

## Resumen

Orion-26B-A4B-v1 es un modelo de lenguaje de tipo MoE (Mixture of Experts) desarrollado por TheDrummer, con 25.805.936.206 parámetros totales y aproximadamente 4 mil millones de parámetros activos por token, tal y como sugiere la nomenclatura A4B. Publicado en Hugging Face en agosto de 2026, el modelo se distribuye en formato safetensors con un tamaño de repositorio de 51,6 GB, lo que indica pesos en precisión completa o en cuantizaciones altas.

El tag `gemma4` presente en el repositorio indica que el modelo está basado en la arquitectura Gemma 4 de Google, aunque no se dispone de la model card completa que confirme los detalles de entrenamiento, contexto o licencia. El autor mantiene un directorio de modelos en Hugging Face Spaces y varios de sus modelos (Cydonia 24B, Valkyrie 49B, Skyfall 36B) están disponibles a través de OpenRouter, lo que sugiere un ecosistema de modelos orientado a despliegue en producción.

La relevancia de este modelo radica en su arquitectura MoE con 4B parámetros activos, que permite un rendimiento razonable en hardware consumer y un coste de inferencia reducido frente a modelos densos de tamaño similar. Su disponibilidad en formato GGUF por parte de BeaverAI y su soporte en plataformas como Jetson (según la guía de Gemma 4 en Jetson) lo hacen candidato para despliegues en edge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 (según tag `gemma4`) |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | ~4.000.000.000 (estimado por nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repo original; existe versión GGUF de BeaverAI |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo original); GGUF disponible en BeaverAI |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. La nomenclatura "26B-A4B" indica un modelo de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos por token, lo que implica una relación de activación de aproximadamente 1:6,5. El tag `gemma4` sugiere que la base arquitectónica es la familia Gemma 4 de Google, que en sus variantes de 26B-A4B y 31B utiliza un diseño MoE con atención de ventana deslizante y atención global, según la documentación de Jetson AI Lab.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o KTO. La existencia de versiones "v1f" y "v1e" en repositorios de terceros (BeaverAI) sugiere iteraciones del modelo con ajustes de configuración o cuantización, pero no hay detalles técnicos públicos sobre estas variantes.

## Capacidades

- Generación de texto: capacidad estándar de un LLM de 26B MoE, con razonamiento básico y generación coherente en tareas de lenguaje general.
- Razonamiento: se espera un rendimiento moderado en tareas de razonamiento lógico y matemático, típico de modelos de 4B activos, aunque no hay benchmarks públicos que lo confirmen.
- Tool calling / function calling: no confirmado; la documentación de Gemma 4 en Jetson menciona soporte de tool calling para los modelos de esa familia, pero no se ha verificado para esta variante concreta.
- Capacidades multilingües: no disponible (sin datos de idiomas soportados).
- Soporte de agentes: no confirmado; no hay evidencia de capacidades de multi-step reasoning o uso de agentes.
- Modo thinking: no disponible; no hay indicación de un modo de razonamiento extendido.

## Casos de uso

- **Despliegue en edge y dispositivos embebidos**: con 4B parámetros activos y soporte documentado para Jetson Orin y Thor (según la guía de Gemma 4 en Jetson), este modelo puede ejecutarse en dispositivos de borde para asistentes locales o procesamiento de texto en tiempo real.
- **Servicios de chat de bajo coste**: a través de OpenRouter, los modelos de TheDrummer se ofrecen como API unificada, lo que permite integrarlo en aplicaciones de chat sin infraestructura propia.
- **Prototipado rápido de aplicaciones LLM**: la disponibilidad de cuantizaciones GGUF facilita la ejecución en CPU o GPUs modestas mediante llama.cpp u Ollama para pruebas de concepto.
- **Generación de texto asistida en entornos con recursos limitados**: el ratio de activación de 1:6,5 reduce la memoria y cómputo por token, permitiendo su uso en entornos donde un modelo denso de 26B no sería viable.
- **Investigación sobre MoE**: su configuración MoE con 4B activos lo convierte en un objeto de estudio para comparar técnicas de sparse attention y expert routing frente a modelos densos de tamaño similar.
- **Evaluación de la familia Gemma 4**: al estar basado en Gemma 4, sirve para comparar el rendimiento de variantes MoE de la familia con las versiones densas (E2B, E4B, 31B) en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para Orion-26B-A4B-v1. La página de AI Market Cap sobre la versión v1e de BeaverAI menciona "benchmark coverage where available", pero no se ha podido acceder a los datos concretos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 25,8B parámetros totales, en cuantización FP16 se necesitarían aproximadamente 51,6 GB de VRAM; con cuantización Q4_K_M (GGUF) se estima entre 15 y 18 GB.
- **GPUs recomendadas**: para FP16 sería necesaria una GPU de datacenter (A100 80GB, H100 80GB) o dos GPUs de 24 GB en paralelo. Para cuantización GGUF Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) sería suficiente; para Q8 se necesitaría ~30 GB.
- **Cabe en consumer GPU**: sí, con cuantización GGUF Q4 en GPUs de 24 GB (RTX 3090, 4090) y con Q3/Q2 en GPUs de 16 GB (RTX 4080, 4070 Ti Super), aunque con pérdida de calidad.
- **Opciones de despliegue**: llama.cpp (GGUF), vLLM (safetensors), Ollama (si se crea un Modelfile), Jetson AI Lab (vLLM o llama.cpp), OpenRouter (API gestionada).
- **Latencia y throughput**: no disponibles; no hay mediciones públicas. Para un MoE de 4B activos, se espera una latencia de ~10-30 tokens/s en una RTX 4090 con cuantización Q4, pero no hay datos verificados.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados. El modelo se puede situar en la categoría de MoE de ~26B totales / 4B activos, similar a Gemma 4 26B-A4B original de Google (no hay datos públicos de este último para comparar) o a otros MoE como Mixtral 8x7B (47B totales, 13B activos) o Qwen 2.5 MoE. Sin información de benchmarks ni specs completas, no es posible realizar una comparativa rigurosa.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1 | 25,8B | ~4B | no disponible | no disponible | v1, en Hugging Face |
| Gemma 4 27B-A4B (referencia) | ~27B | ~4B | no disponible | no disponible | basado en Gemma 4 |
| Mixtral 8x7B (referencia) | 46,7B | 12,9B | 32K | Apache 2.0 | consolidado |

## Limitaciones y advertencias

- **Información incompleta**: la model card del autor no contiene apenas datos (solo `config-v4f`), lo que impide conocer la licencia, los idiomas, el contexto y el proceso de entrenamiento. No se recomienda su uso en producción sin verificar estos aspectos.
- **Licencia desconocida**: no se especifica licencia, lo que genera incertidumbre legal para uso comercial. Es imprescindible contactar con el autor o esperar a que publique la licencia antes de desplegarlo.
- **Sesgos y alucinaciones**: no hay datos sobre evaluación de sesgos o mitigación de alucinaciones. Como modelo de 4B activos, puede presentar tasas de alucinación más altas que modelos grandes en tareas de conocimiento factual.
- **Contexto limitado**: sin datos sobre la longitud de contexto, es arriesgado asumir capacidades de ventana larga. Para tareas de contexto extenso, se recomienda verificar la configuración real.
- **Riesgo de dependencia**: al ser un modelo de un autor individual, la continuidad del proyecto no está garantizada. La falta de documentación puede complicar el mantenimiento.
- **Variantes no oficiales**: la existencia de versiones como v1f o v1e en repositorios de terceros (BeaverAI) puede implicar modificaciones no auditadas; verificar la procedencia de los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1
- Versión GGUF de BeaverAI: https://huggingface.co/BeaverAI/Orion-26B-A4B-v1f-GGUF
- Directorio de modelos de TheDrummer: https://huggingface.co/spaces/TheDrummer/directory
- Perfil de TheDrummer en OpenRouter: https://openrouter.ai/thedrummer
- Guía de Gemma 4 en Jetson: https://www.jetson-ai-lab.com/tutorials/gemma4-on-jetson/
- Página de AI Market Cap sobre v1f: https://aimarketcap.tech/models/beaverai-orion-26b-a4b-v1e-gguf

Nota: no se ha encontrado paper técnico, blog del autor ni documentación adicional en los resultados de búsqueda.
