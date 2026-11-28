# teejer/Ling-3.2-air-mlx-mixed-4-8bit-vl

## Resumen

Ling-3.2-air MLX mixed 4/8-bit (VL) es una conversión cuantizada del modelo `inclusionAI/Ling-3.2-air`, un transformer híbrido con mezcla de expertos (MoE) de 124B parámetros totales y 5.5B activos, publicado originalmente en FP8 con bloques de 128. La conversión la firma el usuario `teejer` y está pensada exclusivamente para el ecosistema MLX de Apple Silicon, no para CUDA. El modelo base emplea la arquitectura `bailing_moe_v3_vl`, que combina capas MoE con atención y un cabezal MTP (multi-token prediction) de tipo NextN, además de una torre de visión en bf16.

El rasgo diferencial de este pack es la cuantización de precisión mixta: las capas de expertos que el perfilado de routing identifica como responsables del procesamiento de código se almacenan a 8 bits (grupo 64, affine), mientras que el resto del modelo se guarda a 4 bits (grupo 64). Las capas elevadas a 8 bits son las índices 11, 12, 17, 20, 23, 24, 27, 29, 30, 32, 35, 36, seleccionadas mediante un perfilado de activaciones top-k del router sobre un corpus de código frente a una línea base de prosa. El resultado es un pack de 92.2 GB orientado a tareas de codificación y con capacidades de visión preservadas.

Es relevante ahora porque permite ejecutar localmente en hardware Apple un modelo de escala 124B con contexto multimodal y decodificación especulativa vía MTP, algo que hasta hace poco requería GPUs de datacenter. No obstante, el repositorio tiene cero descargas y cero likes, fue creado y actualizado el mismo día (28 de noviembre de 2026) y no incluye model card propia más allá de las notas de conversión, por lo que debe tratarse como un artefacto experimental de terceros y no como una distribución oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con torre de visión (`bailing_moe_v3_vl`) y cabezal MTP NextN |
| Parametros totales | 124B (modelo base); 1.239.033.584 tensores reportados en safetensors del pack |
| Parametros activos | 5.5B (modelo base, notación A5.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 4/8 bits: expertos de código a 8 bits (grupo 64, affine), resto a 4 bits (grupo 64); torre visual en bf16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), empaquetado en palabras uint32 |
| Tamano del repositorio | 92.2 GB |
| Modelo base | inclusionAI/Ling-3.2-air (FP8 block-128) |
| Libreria | mlx |
| Cabezal MTP | Conservado en `model.layers.42.*` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con mezcla de expertos: 124B parámetros totales con 5.5B activos por token, lo que sitúa el coste computacional de inferencia en el orden de un modelo denso de ~5-6B. Incorpora un cabezal de predicción multi-token (MTP) de tipo NextN que actúa como decodificador especulativo interno; según las notas del autor, el parche MTP-for-MLX-packs de mlx-serve aporta aproximadamente un +31% de velocidad de decodificación. La torre de visión se conserva en bf16 bajo el prefijo `model.visual.*`, con `vision_config` y M-RoPE con `mrope_section [8,12,12]`, lo que confirma soporte multimodal con posiciones rotatorias multidimensionales para imagen y texto.

El entrenamiento original (número de tokens, composición del dataset, presencia de RLHF/DPO) no está documentado en la información disponible. Lo que sí está documentado es el proceso de cuantización: el autor construyó un kit propio (conversor, perfilador y validador) en `Teejer/ling-3.2-air-mlx`, verificó la dequantización FP8 e4m3fn como exacta frente a torch y validó el pack con decodificación greedy contra la implementación independiente de mlx-lm. La selección de capas a 8 bits se basa en una puntuación por capa definida como concentración de routing top-10 en código multiplicada por la masa específica de código, con procedencia registrada en `mixed-quant.json`. Los bits por tensor son resolubles a partir de la geometría del empaquetado, de modo que mlx-serve carga el pack sin modificaciones.

## Capacidades

- Generación de texto y razonamiento general en inglés.
- Generación y comprensión de código, con capas de expertos reforzadas a 8 bits específicamente para este dominio.
- Comprensión de imágenes: torre visual bf16, `vision_config` y tokens de visión incluidos en el pack.
- Decodificación especulativa mediante cabezal MTP NextN (aceleración reportada de ~+31% en decode con el parche correspondiente).
- Capacidades multilingües limitadas: el único idioma declarado es inglés.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación local en Mac: el pack está optimizado para código mediante la elevación a 8 bits de las capas de expertos con mayor masa de routing en ese dominio, por lo que se adecúa a autocompletado, refactorización y explicación de código en un flujo de trabajo sobre Apple Silicon sin depender de la nube.
- Revisión de código en pipelines de CI: al ejecutarse con mlx-serve, puede exponerse como endpoint local para tareas de análisis estático asistido, generación de parches y detección de patrones defectuosos en diffs, siempre que el hardware Apple disponible soporte los 92.2 GB del pack.
- Análisis de documentación técnica con imágenes: la torre visual permite procesar capturas de diagramas, esquemas de arquitectura o tablas escaneadas junto con texto, útil para extraer especificaciones de manuales técnicos.
- Prototipado de investigación en eficiencia de cuantización: el pack sirve como caso de estudio reproducible de cuantización mixta guiada por perfilado de routing, con procedencia documentada y validación greedy, para equipos que investiguen compresión de MoE.
- Evaluación de decodificación especulativa en MLX: el cabezal MTP conservado permite medir el impacto del patrón NextN en throughput de decode sobre hardware Apple, comparándolo con decodificación autoregresiva estándar.
- Generación de material didáctico técnico en inglés: el ejemplo de validación del autor (temas de álgebra de diagramas de bloques, invariancia estructural y polos) sugiere utilidad para producir apuntes y problemas de ingeniería en inglés.
- Inferencia offline en entornos sin conectividad: al ser un artefacto local de MLX, encaja en escenarios con requisitos de privacidad donde no se permite enviar código o documentación a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una muestra cualitativa de validación greedy y la aceleración aproximada del cabezal MTP (~+31% en decode con el parche de mlx-serve). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el pack ocupa 92.2 GB en disco; la carga en memoria requiere al menos ese orden de magnitud, por lo que se necesita un Mac con memoria unificada de 96 GB o superior (Mac Studio M2 Ultra/ M3 Ultra, MacBook Pro M3/M4 Max con 128 GB).
- GPU recomendadas: no aplica CUDA; el formato es MLX y está diseñado para Apple Silicon (M-series). No es ejecutable en A100, H100 ni RTX 4090 sin reconversión.
- Cabe en GPU de consumo: no en el sentido convencional; requiere Apple Silicon de gama alta con memoria unificada amplia.
- Opciones de despliegue: mlx-serve con las ramas `bailing_hybrid`/`ling-vl` y el parche MTP-for-MLX-packs; mlx-lm como implementación de referencia para validación. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato.
- Latencia y throughput: no disponibles de forma medida; solo la mejora relativa de ~+31% en decode atribuida al cabezal MTP.
- Nota operativa: debe pasarse el directorio del pack como ruta absoluta a mlx-serve.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato/ecosistema | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ling-3.2-air MLX mixed 4/8-bit (VL) | 124B | 5.5B | no disponible | MLX (Apple Silicon) | no disponible | Repo de terceros, 0 descargas |
| inclusionAI/Ling-3.2-air (base) | 124B | 5.5B | no disponible | FP8 block-128 | no disponible | Modelo oficial de referencia |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del pack ni del modelo base en la información proporcionada, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Artefacto de terceros sin validación comunitaria: cero descargas y cero likes, creado y actualizado el mismo día; no es una distribución oficial de inclusionAI.
- Licencia no declarada: no se especifican términos de uso, lo que impide confirmar si el uso comercial está permitido. Debe consultarse la licencia del modelo base antes de cualquier despliegue productivo.
- Idioma limitado al inglés: no hay soporte multilingüe declarado, incluido el castellano.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar cargas de contexto largo con garantías.
- Cuantización agresiva: los 4 bits en la mayor parte de las capas pueden degradar tareas distintas del código; la selección de capas a 8 bits está sesgada hacia codificación y no hacia otros dominios.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas de fidelidad ni de tasas de error.
- Sesgos: no documentados; el corpus de entrenamiento y su composición son desconocidos.
- Dependencia de tooling específico: requiere mlx-serve con ramas concretas y un parche para el MTP; sin ellos, el rendimiento de decode cae y algunas funciones pueden no operar.
- Requisito de memoria elevado: 92.2 GB de pack limita su ejecución a equipos Apple de gama alta con memoria unificada amplia.
- Validación limitada: la verificación reportada es una muestra greedy y una comprobación de dequantización, no una batería de benchmarks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/teejer/Ling-3.2-air-mlx-mixed-4-8bit-vl
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Kit de conversión, perfilado y validación: https://github.com/Teejer/ling-3.2-air-mlx
- Servidor de inferencia mlx-serve: https://github.com/ddalcu/mlx-serve
