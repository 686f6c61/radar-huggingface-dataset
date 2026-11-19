# trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer

## Resumen

Swift-1.5-Flash-Next-Heretic-ReverseEngineer es una cuantización GGUF del modelo jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic, publicada por el usuario trubisky. Se trata de un modelo derivado de la familia Qwen 3.8 con arquitectura Mixture-of-Experts (MoE), que ha sido sometido a un proceso de "abliteration" (eliminación deliberada del comportamiento de rechazo) y posteriormente cuantizado con recetas personalizadas orientadas a tareas de ingeniería inversa, código, razonamiento y matemáticas.

El modelo cuenta con aproximadamente 176.900 millones de parámetros totales según los pesos en safetensors del modelo base, y se distribuye en formato GGUF en varias recetas de cuantización (IQ4_NL, IQ4_XS-plus, IQ3_S-85G) diseñadas para encajar en configuraciones de hardware específicas, en particular una plataforma de 3 GPU V100 de 32 GB (96 GB de VRAM en total). El repositorio ocupa 264 GB e incluye además un paquete de runtime precompilado para el motor Strata.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una ventana de contexto presumiblemente amplia (propia de la familia Qwen 3.8, aunque no se documenta explícitamente en la información disponible), capacidades multimodales de imagen-a-texto (pipeline image-text-to-text), y un ajuste fino de la matriz de importancia (imatrix) específicamente orientado a ingeniería inversa, análisis de binarios y razonamiento agéntico. Es, por tanto, un modelo de nicho para investigadores y desarrolladores que trabajan en seguridad ofensiva, análisis de malware o reversing, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen 3.8 |
| Parametros totales | 176.943.899.520 (~176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL, IQ4_XS-plus, IQ3_S-85G (recetas mixtas personalizadas) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de la familia Qwen 3.8, con 48 capas según la descripción de la receta de cuantización. El autor de la cuantización indica que los pesos heretic v2 fueron desarrollados por jeffpeng3 mediante un proceso de abliteration que, según afirma, logró preservar tanto la capacidad de razonamiento como la longitud de salida del modelo original, algo que describe como una combinación difícil de conseguir. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset del modelo base.

La innovación técnica principal de esta publicación es la receta de cuantización y la matriz de importancia (imatrix) personalizada. La imatrix se construyó con 837 entradas y 399.876 tokens en formato nativo de plantilla de chat Qwen (`<|im_start|>`), distribuida en diez categorías: cadena de pensamiento (22,2%), prompts de sistema (19,5%), diseño y arquitectura (13,5%), uso agéntico de herramientas (12,4%), matemáticas (7,1%), razonamiento espacial (5,4%), trampas y premisas falsas (4,5%), juicio situacional (4,5%), ingeniería inversa (8,8%) y dominio heretic sin rechazo (2,0%). Esta matriz se fusionó con una del equipo AtomicChat, con un peso del 70% para la matriz propia en los canales con datos sólidos y hasta el 100% de la de AtomicChat en canales con pocas muestras.

La asignación de bits de la receta IQ4_NL se concentra en las últimas 12 capas, tras detectar mediante auditoría de energía de activación que la energía de la proyección descendente se triplica a partir de la capa 36 y alcanza su pico en la capa 47 (el tensor más caliente de la red, 48 veces la capa 2). El objetivo declarado es encajar exactamente en 96 GB de VRAM bajo el motor Strata, dejando margen para el proyector de visión (mmproj), el prefill por lotes de 8192 tokens y el streaming de KV.

## Capacidades

- Generación de texto y razonamiento paso a paso, con capacidad de auto-verificación y backtracking (según la composición de la imatrix).
- Generación y revisión de código, planificación de APIs y refactorización.
- Matemáticas: aritmética, álgebra, demostraciones y manipulación simbólica.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text), con proyector de visión (mmproj) mencionado en la receta.
- Soporte de tool calling y function calling, con cadenas de llamadas a herramientas y bucles de edición de ficheros.
- Comportamiento agéntico y razonamiento multi-paso con recuperación de errores.
- Capacidades multilingües limitadas a inglés y chino.
- Capacidades especializadas en ingeniería inversa: desensamblado x86-64/ARM64, crítica de descompilación de Ghidra, internals de ELF/PE/Mach-O, anti-debug/anti-VM, deobfuscación de cadenas, desaplanado de CFG, devirtualización, tracing con LD_PRELOAD/Frida/eBPF, análisis de firmware y round-tripping de formatos.
- Modo sin rechazo (uncensored) en el dominio heretic, con respuestas directas sobre cadenas de explotación ELF, inyección de procesos, parcheo de comprobaciones de licencia y protocolos C2.

## Casos de uso

- Análisis de malware y reversing de binarios: el modelo puede analizar desensamblados x86-64/ARM64, criticar salidas de descompiladores como Ghidra y razonar sobre internals de ELF/PE/Mach-O, gracias a que la imatrix dedica un 8,8% de su corpus a estas tareas.
- Auditoría de seguridad ofensiva: permite generar y evaluar cadenas de explotación ELF, técnicas de inyección de procesos frente a EDR y mecánicas de parcheo de comprobaciones de licencia, al haber eliminado el comportamiento de rechazo en ese dominio.
- Desarrollo de plugins y extensiones: el corpus de ingeniería inversa incluye fusión de ABI de plugins y round-tripping de formatos, útil para integrar componentes binarios en proyectos propios.
- Asistencia en pipelines de CI/CD para análisis estático: con soporte de tool calling y bucles de edición de ficheros, puede integrarse como agente que inspecciona artefactos, propone parches y verifica resultados.
- Investigación en seguridad de firmware: el modelo cubre análisis de firmware y tracing con eBPF/Frida, lo que permite asistir en la instrumentación dinámica de dispositivos embebidos.
- Automatización de tareas de razonamiento espacial: la imatrix incluye un 5,4% de contenido de rejillas, transformadas 2D/3D y coordenadas, adecuado para herramientas de disposición y empaquetado en entornos 3D.
- Despliegue en infraestructura de gama alta existente: las recetas están dimensionadas para 3×V100 de 32 GB (96 GB de VRAM) bajo el motor Strata, lo que permite reutilizar hardware de centro de datos sin necesidad de GPUs más modernas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la receta IQ4_NL ocupa ~108,9 GB en 8 shards, dimensionada para 96 GB de VRAM (3×V100 de 32 GB) con margen para mmproj, prefill de 8192 tokens y streaming de KV. La receta IQ4_XS-plus ocupa 94,7 GB en 6 shards. La receta IQ3_S-85G ocupa ~84,6 GB en 8 shards (3,36 bpw de masa experta).
- GPU recomendadas: 3×NVIDIA V100 de 32 GB (configuración objetivo declarada); no se documentan recomendaciones para A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? No disponible según la información proporcionada; los tamaños de archivo (84,6-108,9 GB) exceden la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: motor Strata (paquete de runtime precompilado incluido: dense.bin, index.txt, native_experts.txt, conversions.json, compat-bf16.json, tokenizer); el formato GGUF es compatible con llama.cpp y derivados, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (este) | ~176,9 B (MoE) | no disponible | swift-open-license-1.0 | GGUF en HF, 9228 descargas | Cuantización con imatrix orientada a reversing |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic | no disponible | no disponible | no disponible | Pesos base en HF | Modelo base sin cuantizar del que deriva este |
| johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN | no disponible | no disponible | no disponible | Pesos Halogen v2 en HF | Variación comunitaria del mismo modelo |
| skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw | no disponible | no disponible | no disponible | Pesos MLX en HF | Variación comunitaria en formato MLX (4,7 bpw) |

## Limitaciones y advertencias

- Modelo sin censura (uncensored): el comportamiento de rechazo se ha eliminado deliberadamente. El usuario es el único responsable del uso y debe cumplir la legislación aplicable y la licencia.
- Riesgo elevado de contenido sensible: el dominio heretic incluye respuestas directas sobre explotación de binarios, inyección de procesos y protocolos C2, lo que lo hace inadecuado para despliegues públicos sin supervisión.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; al ser un modelo abliterado y cuantizado a 3-4 bits, la fidelidad factual puede degradarse respecto al modelo base.
- Limitaciones de idioma: solo inglés y chino; no se documenta soporte de castellano.
- Restricciones de licencia: swift-open-license-1.0 (license: other); deben revisarse los términos exactos en el enlace de licencia antes de cualquier uso comercial.
- La cuantización agresiva (IQ3_S-85G a 3,36 bpw) puede degradar capacidades generales pese al refuerzo de la imatrix en canales específicos.
- El despliegue requiere hardware especializado (3×V100) y un motor no estándar (Strata); la compatibilidad con otros runtimes no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Modelo base: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Variación Halogen v2: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN
- Variación MLX: https://huggingface.co/skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw
