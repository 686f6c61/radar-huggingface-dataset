# SurgeFF/AriaV32

## Resumen

AriaV32, también distribuido bajo el nombre interno Rika V32, es un derivado de ajuste continuado (continuously-trained) del modelo multimodal Gemma-4-26B-A4B-it de Google, publicado por el usuario SurgeFF en Hugging Face. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, e incluye un proyector de visión independiente (mmproj) que habilita el procesamiento de imágenes junto con texto.

El modelo conserva la arquitectura Mixture-of-Experts del Gemma-4 original, con 25.233.142.046 parámetros totales según los pesos en safetensors y aproximadamente 4.000 millones de parámetros activos por token (según la nomenclatura A4B del modelo base). El repositorio ocupa 86,6 GB e incluye cuatro cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M) más el proyector visual en f16.

Su relevancia es doble: por un lado, ofrece una alternativa cuantizada y ejecutable localmente de un modelo multimodal de última generación; por otro, la model card documenta un hallazgo técnico concreto sobre la interacción entre el sampler DRY y la copia literal de texto, con pérdidas medidas de 2,2 puntos en MMLU-Pro y 29 puntos en BBH. La licencia Apache-2.0 facilita su adopción comercial, aunque el modelo base de Google arrastra sus propias condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (derivado de Gemma-4-26B-A4B-it) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4.000 millones (designación A4B del modelo base) |
| Longitud de contexto | 32.768 tokens (configuración de servicio documentada con `-c 32768`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M; proyector de visión en f16 |
| Idiomas soportados | Inglés (único idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors para el recuento de parámetros |

## Arquitectura y entrenamiento

El modelo es un derivado de ajuste continuado de google/gemma-4-26b-a4b-it, un transformer con arquitectura Mixture-of-Experts en el que se activan aproximadamente 4.000 millones de parámetros por token sobre un total de 25.233 millones. La componente multimodal se implementa mediante un proyector de visión separado (mmproj-RikaV32-f16.gguf, 1,1 GB) que se carga junto con los pesos principales en llama.cpp. El proyector es específico de versión: la model card advierte explícitamente que un tamaño de archivo idéntico entre versiones no implica que el archivo sea el mismo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste continuado ni el uso de RLHF o DPO en la información proporcionada. La model card sí documenta una innovación operativa relevante: el modelo está configurado para razonamiento con formato deepseek (`--reasoning-format deepseek`) y admite desactivación del modo razonamiento (`--reasoning off`). Además, se ha medido que el sampler DRY (`--dry-multiplier`) corrompe la copia literal de texto y degrada el rendimiento en 2,2 puntos porcentuales en MMLU-Pro y 29 puntos porcentuales en BBH con `--repeat-penalty 1.05`, por lo que se desaconseja su uso.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento multimodal de imágenes mediante el proyector mmproj en f16.
- Modo de razonamiento configurable con formato deepseek, activable o desactivable en el servidor.
- Copia literal de texto verbatim (siempre que no se active el sampler DRY).
- Inferencia local mediante llama.cpp con soporte de plantillas Jinja (`--jinja`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta soporte de audio.

## Casos de uso

- Asistente conversacional local con privacidad de datos: el modelo puede desplegarse íntegramente en infraestructura propia mediante llama.cpp, sin enviar información a APIs externas, gracias a su formato GGUF y a su licencia Apache-2.0.
- Análisis de documentos con imágenes: la combinación de pesos principales y proyector de visión permite procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en una única sesión de 32.768 tokens.
- Extracción y copia literal de contenido: el modelo está validado para tareas de copia verbatim siempre que se evite el sampler DRY, lo que lo hace adecuado para transcripción asistida y reformateo fiel de textos.
- Razonamiento multi-paso con control de coste: el modo razonamiento deepseek puede desactivarse para consultas simples y activarse para tareas complejas, ajustando la latencia y el consumo de tokens según la necesidad.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (15,6 GB) permite ejecutar un modelo de 25.000 millones de parámetros totales en GPUs con 16-24 GB de VRAM, algo inviable con los pesos en precisión completa.
- Prototipado e investigación sobre modelos MoE multimodales: el acceso a cuatro niveles de cuantización y a un proyector independiente facilita experimentos de evaluación comparativa entre precisiones sin necesidad de reentrenar.
- Servicio conversacional ligero en inglés: con Q6_K (21,1 GB) y una ventana de 32.768 tokens, puede atender sesiones de chat de larga duración en inglés con una sola GPU de 24 GB o superior.

## Benchmarks y rendimiento

No se han publicado resultados absolutos de benchmarks en la información disponible. La model card únicamente reporta deltas relativos medidos al activar el sampler DRY con `--repeat-penalty 1.05`:

| Benchmark | Efecto de activar DRY |
|---|---|
| MMLU-Pro | -2,2 puntos porcentuales |
| BBH | -29 puntos porcentuales |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 25,0 GB con Q8_0; 21,1 GB con Q6_K; 17,8 GB con Q5_K_M; 15,6 GB con Q4_K_M; más 1,1 GB adicionales para el proyector de visión en f16.
- GPU recomendadas: A100 (40/80 GB) o H100 para Q8_0 con contexto completo; RTX 4090 (24 GB) para Q6_K o Q5_K_M; GPUs de 16 GB para Q4_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, con Q4_K_M en GPUs de 16 GB o superiores y con Q5_K_M/Q6_K en RTX 4090 o equivalentes de 24 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server`; el formato GGUF es compatible con otros runners basados en llama.cpp, aunque la model card solo documenta el servidor oficial.
- Latencia y throughput: no disponibles en la información proporcionada. La activación del MoE con aproximadamente 4.000 millones de parámetros activos sugiere un coste computacional por token inferior al de un modelo denso de 25.000 millones, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AriaV32 (Rika V32) | 25.233 millones (aproximadamente 4.000 millones activos) | 32.768 tokens | Apache-2.0 | GGUF | Multimodal con proyector separado; solo inglés |
| google/gemma-4-26b-a4b-it | 25.233 millones (aproximadamente 4.000 millones activos) | No disponible | No disponible | No disponible | Modelo base del que deriva AriaV32 |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos en la información proporcionada |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documenta capacidad multilingüe.
- El proyector de visión es específico de versión: usar un mmproj de otra versión, aunque tenga el mismo tamaño en bytes, puede producir resultados incorrectos.
- El sampler DRY corrompe la copia literal de texto y degrada el rendimiento en MMLU-Pro (-2,2 puntos porcentuales) y BBH (-29 puntos porcentuales) con `--repeat-penalty 1.05`; no debe activarse.
- No se documentan datos sobre sesgos, tasa de alucinación ni evaluación de seguridad en la información disponible.
- La licencia del repositorio es Apache-2.0, pero al ser un derivado de un modelo de Google, el uso comercial puede quedar sujeto adicionalmente a las condiciones de uso de Gemma; conviene verificar esta compatibilidad antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes que dependan de esas capacidades.
- El contexto máximo documentado es de 32.768 tokens; no se especifica si el modelo base soporta ventanas mayores.

## Enlaces

- Hugging Face: https://huggingface.co/SurgeFF/AriaV32
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- llama.cpp (repositorio del runtime): https://github.com/ggml-org/llama.cpp
