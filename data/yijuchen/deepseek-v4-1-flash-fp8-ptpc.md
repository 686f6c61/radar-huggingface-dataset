# yijuchen/DeepSeek-V4.1-Flash-FP8-PTPC

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 552B parámetros en el backbone y soporte nativo de contextos de hasta un millón de tokens. Procesa imágenes y texto de forma conjunta y genera texto de manera autorregresiva. Su rasgo diferencial es la arquitectura Causal Encoder-Decoder (CED), que proyecta la caché KV global del decodificador desde los estados ocultos del encoder en lugar de derivarla capa a capa, permitiendo activar solo 8B parámetros por token durante el prefill y 16B durante la decodificación. Está pensado para cargas de trabajo agénticas con mucho input, donde el coste de la caché KV domina el gasto de inferencia.

La ficha que se documenta aquí corresponde a **yijuchen/DeepSeek-V4.1-Flash-FP8-PTPC**, una conversión comunitaria a FP8 (W8A8) del modelo original de DeepSeek, publicada bajo licencia MIT y con un repositorio de 300,6 GB. No es una publicación oficial de DeepSeek: el autor es un tercero, no tiene descargas ni valoraciones registradas y la model card reutiliza el material del modelo original.

La relevancia actual del modelo base radica en su estrategia de compresión de caché KV: DeepSeek-V4.1-Flash reduce la caché KV global a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1, gracias a Compressed Sparse Attention 2 (CSA2) y al almacenamiento de la KV principal en FP4. Esta conversión FP8 facilita el despliegue en hardware con soporte de FP8 nativo, aunque el tamaño del repositorio invita a verificar su integridad antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (CED) de 40 capas (20 de encoder causal + 20 de decoder), con MoE, atención dispersa CSA2, memoria condicional Engram y encoder de visión DeepSeek-ViT |
| Parámetros totales | 552B en el backbone; componente Engram de memoria condicional de 196B parámetros adicionales |
| Parámetros activos | 8B por token durante el prefill; 16B por token durante la decodificación |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantización | Este repositorio: FP8 W8A8 (etiqueta `w8a8_fp8`). El modelo original usa KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Compatible con `transformers`; el contenedor exacto (safetensors u otro) no se especifica en la información disponible. Repositorio de 300,6 GB |
| MoE (detalle) | 1 experto compartido y 384 expertos enrutados por capa MoE; se activan 6 expertos enrutados por token |
| Caché KV global | ~890 bytes por token (aproximadamente 1/4 de DeepSeek-V4-Flash y 1/437 de DeepSeek-V1) |
| Modalidad de entrada | Texto e imagen (pipeline `image-text-to-text`) |
| Salida | Texto |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder de 40 capas, dividida en 20 capas de encoder causal seguidas de 20 capas de decoder. En lugar de que cada capa del decoder derive su propia caché KV, la caché KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, lo que rebaja la activación a 8B parámetros por token en prefill y 16B en decodificación. El mecanismo SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando únicamente los *n*_win tokens más recientes, evitando persistir esa caché en SSD y dejando la huella de caché KV persistente en torno a 1/8 de la de DeepSeek-V4-Flash.

El motor de atención es Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar índices de atención dispersa Top-K. En el decoder, un indexador disperso jerárquico restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud del contexto. Se suman Single-Pass mHC (mezcla revisada del flujo residual con el kernel Mega-mHC), memoria condicional Engram (196B parámetros con acceso disperso mediante búsqueda por token) y decodificación especulativa DSpark, con generación de borradores semiautorregresiva y verificación planificada por confianza. El componente multimodal combina el encoder de visión DeepSeek-ViT (entrenado desde cero con 2D-RoPE y reducción de resolución por pixel-unshuffle 3×3) con un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados junto al texto desde el inicio del preentrenamiento.

El preentrenamiento se realiza desde cero sobre un corpus multimodal de 45T tokens, con la atención dispersa entrenada a una longitud de secuencia de 64K y el contexto extendido hasta 1M tokens a los 34T tokens. El postentrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios se concentran en el pipeline de datos, con síntesis automática a gran escala de tareas y entornos agénticos y escalado progresivo de datos, tareas y rollouts. El modelo admite un ajuste de esfuerzo de razonamiento continuo y controlable mediante un entero de 1 a 100 que intercambia coste de inferencia por precisión.

## Capacidades

- Generación de texto autorregresiva con contextos de hasta 1.000.000 de tokens.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), con entrada visual gestionada por el encoder DeepSeek-ViT.
- Razonamiento con esfuerzo controlable: el parámetro entero de 1 a 100 permite ajustar el equilibrio entre coste de inferencia y precisión.
- Capacidades agénticas y de razonamiento multi-paso, reforzadas en el postentrenamiento mediante síntesis automática de tareas y entornos agénticos.
- Flujos de trabajo con mucho input (input-heavy), optimizados por la activación reducida de 8B parámetros por token en prefill.
- Decodificación especulativa integrada (DSpark) para acelerar la generación.
- Memoria condicional Engram con acceso disperso por token, orientada a recuperar información sin activar la totalidad de sus 196B parámetros.
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en la información disponible.
- Idiomas soportados: no disponible en la información proporcionada.
- Soporte de audio: no disponible; el modelo descrito es texto-imagen a texto.

## Casos de uso

- Agentes autónomos con historiales largos: con 1M tokens de contexto y solo 8B parámetros activos en prefill, resulta adecuado para agentes que acumulan trazas, documentos y resultados de herramientas durante sesiones prolongadas sin disparar el coste de cómputo por token de entrada.
- Atención al cliente automatizada: la ventana de contexto permite mantener conversaciones multi-turno con el historial completo, documentación de producto y registros de incidencias en la misma ventana, reduciendo la necesidad de resumir o truncar el contexto.
- Análisis de documentos extensos con componentes visuales: informes financieros, contratos o artículos científicos con tablas y figuras pueden procesarse conjuntamente como imagen y texto gracias al encoder de visión, sin un pipeline OCR separado.
- Generación y revisión de código en pipelines de CI/CD: el contexto largo permite pasar repositorios o diffs completos al modelo; el ajuste de esfuerzo de razonamiento (1-100) permite usar un modo rápido para revisiones superficiales y un modo costoso para análisis de seguridad.
- Razonamiento sobre bases de código o corpus normativos: con 1M tokens se pueden cargar conjuntos de documentación legal o técnica completos y formular consultas que requieran cruzar información de múltiples secciones.
- Extracción estructurada de información multimodal: digitalización de formularios, facturas o documentos escaneados donde el modelo recibe la imagen y devuelve texto estructurado.
- Asistentes de investigación y revisión bibliográfica: ingesta de grandes volúmenes de artículos junto con sus figuras para resumir, comparar metodologías o detectar contradicciones.
- Tareas agénticas de larga duración con verificación: la decodificación especulativa DSpark y la caché KV reducida a ~890 bytes por token facilitan mantener sesiones de agente con muchos pasos sucesivos.
- Despliegue en clústeres con aceleradores FP8: al publicarse en W8A8 FP8, encaja en infraestructuras con soporte nativo de FP8 (H100, H200, B200), con menor consumo de memoria de pesos que una versión en BF16.

## Benchmarks y rendimiento

La información proporcionada incluye únicamente referencias cualitativas a la figura «Performance of DeepSeek-V4.1-Flash and counterparts on agentic benchmarks» y al apartado «Evaluation Results», cuyo contenido numérico está truncado. No se han publicado resultados de benchmarks en la información disponible, por lo que no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones agénticas.

Únicamente se documentan como datos comparativos las ratios de caché KV por token:

| Métrica | DeepSeek-V4.1-Flash | Referencia |
|---|---|---|
| Caché KV global por token | ~890 bytes | 1/4 respecto a DeepSeek-V4-Flash; 1/437 respecto a DeepSeek-V1 |
| Huella de caché KV persistente | ~1/8 de DeepSeek-V4-Flash | Según SWA Bounded Replay |
| Parámetros activos en prefill | 8B por token | No disponible para los comparadores |
| Parámetros activos en decodificación | 16B por token | No disponible para los comparadores |

## Requisitos de hardware

- VRAM estimada para inferencia: con 552B parámetros en FP8 (1 byte por parámetro) los pesos del backbone rondan los 552 GB; si el componente Engram de 196B parámetros se almacenase también en FP8, el total superaría los 700 GB. Son estimaciones derivadas de los recuentos de parámetros publicados, no cifras confirmadas por el autor. El repositorio publicado ocupa 300,6 GB, por debajo de la estimación para 552B en FP8, por lo que conviene verificar la integridad y el alcance de la conversión antes de planificar el despliegue.
- GPU recomendadas: nodos multi-GPU con aceleradores de FP8 nativo, como H100 (80 GB), H200 (141 GB) o B200. Un nodo de 8×H100 ofrece 640 GB de memoria agregada, potencialmente insuficiente para el modelo completo; serían necesarios 16×H100 o 8×H200 (1.128 GB agregados) en el escenario más conservador.
- Cabe en GPU de consumo: no. Ni en RTX 4090 (24 GB), ni en RTX 3090 (24 GB), ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: el repositorio declara `library_name: transformers` y lleva la etiqueta `endpoints_compatible`, lo que apunta a despliegue mediante Transformers y endpoints compatibles. El soporte en vLLM, SGLang, TGI, llama.cpp u Ollama no está confirmado en la información disponible; las arquitecturas CED y CSA2, la memoria Engram y la atención dispersa requieren implementaciones específicas, por lo que no debe asumirse compatibilidad con motores genéricos.
- Latencia y throughput estimados: no disponibles. Los únicos indicadores publicados son de coste estructural: 8B parámetros activos por token en prefill, 16B en decodificación, ~890 bytes de caché KV por token y decodificación especulativa DSpark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (FP8 comunitario, yijuchen) | 552B backbone + 196B Engram | 1M tokens | ~890 bytes | MIT | Repositorio comunitario de 300,6 GB, 0 descargas |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4× la de V4.1-Flash | No disponible | No disponible |
| DeepSeek-V1 | No disponible | No disponible | ~437× la de V4.1-Flash | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparados en la información proporcionada, por lo que la comparación se limita a la métrica de caché KV documentada y al tamaño del backbone. No se dispone de información sobre alternativas de otros fabricantes con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Conversión de terceros: el repositorio lo publica el usuario `yijuchen`, no DeepSeek. No hay garantía de que los pesos FP8 reproduzcan fielmente el comportamiento del modelo original, ni de que la conversión esté validada.
- Repositorio sin tracción: cero descargas y cero valoraciones, lo que limita la evidencia empírica sobre su funcionamiento.
- Discrepancia de tamaño: el repositorio ocupa 300,6 GB frente a los ~552 GB estimados para 552B parámetros en FP8. Conviene comprobar si faltan ficheros o si parte de los pesos se almacena en menor precisión.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y debe mitigarse con verificación externa, especialmente en dominios factuales.
- Sesgos conocidos: no disponibles. No se documenta composición del dataset ni evaluación de sesgos.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento homogéneo fuera de los idiomas mayoritarios del corpus de entrenamiento.
- Licencia: MIT, permisiva y compatible con uso comercial, pero la licencia se aplica al repositorio de la conversión; conviene verificar los términos aplicables al modelo base original de DeepSeek.
- Restricciones de despliegue: el requisito de memoria (cientos de GB) excluye hardware de consumo y obliga a infraestructura multi-GPU o multi-nodo. La compatibilidad con motores de inferencia habituales no está confirmada.
- Arquitectura poco estándar: CED, CSA2, Engram y DSpark requieren kernels y rutas de ejecución específicas; los frameworks genéricos pueden no soportarlas, lo que afecta a portabilidad y mantenimiento.
- Fecha de publicación: el repositorio está fechado en septiembre de 2026 según los metadatos, dato a tener en cuenta para evaluar su vigencia.
- Sin resultados de benchmarks numéricos publicados en la información disponible, no es posible estimar su calidad relativa frente a alternativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yijuchen/DeepSeek-V4.1-Flash-FP8-PTPC
- Modelo base referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe técnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
