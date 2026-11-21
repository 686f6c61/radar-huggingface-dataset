# WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3

## Resumen

Inkling-2-Mini-UD-IQ1_M-NInfer-v3 es un artefacto de cuantización publicado por WaveCut para el motor de inferencia NInfer, derivado del modelo base Inkling-2-Mini de Thinking Machines. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura de transformer con bucles ("looped transformer") de 26.400 millones de parámetros totales y 3.400 millones activos por token, con capacidad de visión y tool calling. El artefacto parte de la cuantización UD-IQ1_M de Unsloth y la reempaqueta en el formato propietario `.ninfer` del motor NInfer, preservando los bloques ggml originales sin recuantizar.

La relevancia de esta ficha radica en que no es un modelo nuevo, sino un contenedor de inferencia optimizado: permite ejecutar el modelo completo (texto, visión y decodificación especulativa con el drafter DSpark) en un único fichero de 8,18 GiB, con expertos enrutados que pueden residir en GPU, en memoria anfitriona fijada o leerse desde disco. Está pensado para despliegues con GPUs NVIDIA desde Volta hasta Blackwell y para servir entre una y ocho peticiones concurrentes con reutilización de prefijos de prompt.

Al tratarse de una cuantización IQ1_M (aproximadamente 1,75 bits por peso en las matrices de expertos), el modelo prioriza la huella de memoria sobre la fidelidad numérica: Unsloth reporta una divergencia KL media de 0,0867 respecto a UD-Q8_K_XL y coincidencia en el token superior en el 90,2 % de las posiciones. Es, por tanto, una opción para entornos con VRAM muy limitada, no para producción de alta precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y mezcla de expertos (MoE); 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, núcleo 6-17 tres veces, coda 18-23) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B) por token; 8 de 128 expertos enrutados por token |
| Longitud de contexto | No disponible explícitamente; la atención usa una tabla aprendida de 1.024 distancias y ventana de 1.024 posiciones en la mayoría de capas, con atención global en las capas 5, 11, 17 y 23 |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ4_XS, Q2_0, Q4_K, Q5_K, Q6_K, Q8_0, NVFP4, BF16 y FP32 según componente |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto propietario de NInfer v3); origen GGUF UD-IQ1_M de Unsloth, sin recuantización |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas físicas se ejecutan como 48 visitas, donde el núcleo (capas 6-17) se recorre tres veces con los mismos pesos, cada visita con sus propias claves, valores e historiales de convolución. La atención usa 24 cabezas de consulta sobre 8 cabezas KV de dimensión 128, sin rotación posicional, con una tabla aprendida de 1.024 distancias y mecanismo de "sinks". La capa MoE contiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoideas más un sesgo de selección, activación SiTU sobre la concatenación [gate; up] de anchura 1.152, y sin experto compartido. La tabla de tokens tiene 201.024 filas con cabeza no atada y soft cap de 30.

El artefacto incluye además tres componentes auxiliares: una torre de visión ViT con fila de clase, filas de posición redimensionadas, cabezas con rotación 2D, fusión 2x2 y proyector de dos capas (hasta 4.096 posiciones por imagen, matrices Q8_0); un drafter DSpark con tres bloques no causales sobre los estados extraídos del modelo objetivo y una cabeza de Markov recurrente de rango 256 (Q8_0); y el tokenizador, plantilla de chat y configuración de generación del repositorio original en la revisión `ed40e7da`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La conversión a `.ninfer` se realizó con la receta `inkling2_gguf` del motor NInfer a partir de tres fuentes: el GGUF UD-IQ1_M de Unsloth (revisión `ae9327c5`), el `mmproj-Inkling-2-Mini-Q8_0.gguf` de ggml-org (revisión `db61c5b4`) y el `dspark-Inkling-2-Mini-Q8_0.gguf` de Unsloth. El proceso tardó 28 segundos en un contenedor sobre una RTX 3090 alquilada y generó un fichero de 8.785.600.768 bytes (8,18 GiB) con 1.203 objetos tensoriales.

## Capacidades

- Generación de texto y razonamiento: el modelo expone su razonamiento en bloques propios separados de la respuesta.
- Tool calling: devuelve bloques JSON de llamada a herramientas como tool calls en formato OpenAI, con argumentos estrictos y salida estructurada.
- Decodificación especulativa: usa el drafter DSpark del release (activo por defecto con una sola petición en vuelo) o decodificación por búsqueda en contexto.
- Visión: procesa imágenes a través de la torre ViT incluida, con hasta 4.096 posiciones por imagen; pipeline `image-text-to-text`.
- Decisiones tipadas y reranking: soporta salidas con tipos definidos y reordenación de candidatos.
- Concurrencia: atiende de una a ocho peticiones simultáneas con reutilización de prefijos de prompt.
- Gestión de expertos: los expertos enrutados pueden residir en GPU, en memoria anfitriona fijada o leerse directamente del fichero.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente con visión en hardware de gama media: el artefacto de 8,18 GiB permite ejecutar un modelo multimodal de 26,4B en GPUs con 12-16 GB de VRAM descargando expertos a memoria anfitriona, algo inviable con cuantizaciones de mayor precisión.
- Automatización de soporte técnico con capturas de pantalla: la torre ViT Q8_0 procesa imágenes de hasta 4.096 posiciones, lo que permite interpretar capturas de error o interfaces y responder con tool calls para abrir tickets o consultar estado.
- Agentes con llamadas a herramientas en pipelines internos: la salida de tool calls en formato OpenAI con argumentos estrictos facilita la integración directa con frameworks de agentes sin capa de traducción.
- Servicio multiusuario de baja concurrencia: NInfer soporta de una a ocho peticiones concurrentes con reutilización de prefijos, adecuado para equipos pequeños o entornos de demostración donde el coste de GPU es la restricción principal.
- Reranking y clasificación tipada en motores de búsqueda: las decisiones tipadas y el reranking nativo permiten reordenar resultados de recuperación sin un modelo adicional.
- Aceleración de latencia en inferencia interactiva: la decodificación especulativa con DSpark reduce el número de pasos del modelo objetivo, útil en aplicaciones de chat donde la latencia percibida importa.
- Despliegue en estaciones de trabajo con GPUs Volta o Turing: el motor NInfer cubre desde Volta hasta Blackwell, lo que permite reutilizar hardware como V100 o RTX 2080 Ti con la imagen Docker `cuda12.9`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad numérica es la divergencia KL media de 0,0867 respecto a UD-Q8_K_XL medida por Unsloth, con coincidencia en el token superior en el 90,2 % de las posiciones. La cuantización UD-IQ1_S, ligeramente más pequeña (0,26 GB menos), presenta una divergencia KL de 0,0911, por lo que UD-IQ1_M se sitúa como el punto de compromiso elegido por el autor.

## Requisitos de hardware

- VRAM estimada: el fichero completo ocupa 8,18 GiB; con overhead de contexto, estados KV y buffers de cómputo, se recomienda un mínimo de 12 GB de VRAM para mantener los expertos en GPU. Con expertos en memoria anfitriona fijada, la VRAM puede reducirse a 8-10 GB a costa de ancho de banda PCIe.
- GPUs recomendadas: NVIDIA desde Volta hasta Blackwell. Para servir con holgura, A100, H100, RTX 4090 o RTX 3090. Para despliegue ajustado, RTX 4070 Ti, RTX 3080 o Tesla V100 (imagen Docker `cuda12.9`).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen amplio y en RTX 3090 (24 GB); en RTX 4070 (12 GB) requiere derivar expertos a memoria anfitriona.
- Opciones de despliegue: exclusivamente el motor NInfer (rama `master` de `iamwavecut/ninfer-all`), versión `2026-11-21.3` o posterior, o la imagen Docker `cuda13.4`/`cuda12.9`. Las compilaciones estándar de NInfer rechazan este fichero por la torre de visión Q8_0. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con DSpark está activa por defecto con una sola petición en vuelo, lo que debería reducir la latencia por token respecto a la decodificación autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| Inkling-2-Mini UD-IQ1_M (NInfer v3) | 26,4B / 3,4B | No disponible (atención 1.024 posiciones en la mayoría de capas) | IQ1_M (~8,18 GiB) | Apache 2.0 | NInfer |
| Inkling-2-Mini UD-Q2_K_XL (NInfer v3) | 26,4B / 3,4B | No disponible | Q2_K_XL | Apache 2.0 | NInfer |
| Inkling-2-Mini UD-Q3_K_XL (NInfer v3) | 26,4B / 3,4B | No disponible | Q3_K_XL | Apache 2.0 | NInfer |
| Inkling-2-Mini UD-IQ4_XS (NInfer v3) | 26,4B / 3,4B | No disponible | IQ4_XS | Apache 2.0 | NInfer |

Las alternativas directas son las otras cuantizaciones del mismo modelo publicadas por el mismo autor; no se dispone de información sobre modelos de otros desarrolladores con arquitectura, tamaño y capacidades comparables para establecer una comparativa cruzada fiable.

## Limitaciones y advertencias

- Fidelidad numérica reducida: la cuantización IQ1_M implica una divergencia KL media de 0,0867 respecto a Q8_K_XL; el 9,8 % de las posiciones no coinciden en el token superior. No es adecuada para tareas que exijan precisión numérica alta.
- Compatibilidad restringida: solo funciona con NInfer `2026-11-21.3` o posterior. Las compilaciones estándar rechazan el fichero, lo que limita la portabilidad frente a GGUF estándar.
- Ecosistema monolítico: al no ser compatible con llama.cpp, vLLM, Ollama ni TGI, no se puede integrar en infraestructuras de serving convencionales sin adaptación.
- Idiomas no documentados: la model card no especifica la cobertura lingüística; el rendimiento en castellano no está verificado.
- Longitud de contexto no confirmada: aunque la atención usa ventanas de 1.024 posiciones con capas globales, no se declara una longitud máxima de contexto utilizable, lo que dificulta planificar cargas con prompts largos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos para esta cuantización; el comportamiento puede diferir del modelo base sin cuantizar.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el artefacto depende del modelo base de Thinking Machines y de las cuantizaciones de Unsloth; conviene verificar las condiciones de los repositorios de origen.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 21 de noviembre de 2026, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor NInfer (rama master): https://github.com/iamwavecut/ninfer-all
- Repositorio NInfer original: https://github.com/Neroued/ninfer
- Releases de NInfer: https://github.com/iamwavecut/ninfer-all/releases/latest
- Otras cuantizaciones del mismo autor:
  - https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
  - https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
  - https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
  - https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
