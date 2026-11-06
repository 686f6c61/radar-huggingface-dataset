# WannaGoTech/WannaMed-Monet

## Resumen

WannaMed-Monet es un modelo multimodal desarrollado por WannaGoTech, orientado a aplicaciones médicas en dispositivos de borde (smartphones y tabletas). Combina cuatro capacidades en un único modelo: reconocimiento automático de voz (ASR) para dictado clínico en tiempo real con streaming causal de 480 ms, estructuración de informes clínicos sobre 329 plantillas XML, razonamiento clínico y visión médica multimodal que abarca imagen 2D/3D (volúmenes SLICE 1..N), ECG de 12 derivaciones y OCR de documentos médicos (análisis de laboratorio y recetas).

El modelo declara 5.123.178.051 parámetros en pesos maestros BF16 (9,77 GB), con un diseño que permite ejecutarse con solo 1,28 GB de RAM activa en dispositivos móviles mediante LiteRT y descarga dinámica (offload) de 2,35B parámetros PLE. Según el autor, retiene el 99,91 % de la capacidad diagnóstica de WannaMed Seurat (4B), del que deriva por transferencia ortogonal de variedad clínica (SVD de Procrustes) y entrenamiento recursivo en tres rondas sobre 42 referenciales médicos.

Su relevancia actual radica en la propuesta de inferencia 100 % offline en el dispositivo, sin conexión, lo que resulta crítico en entornos clínicos con requisitos de privacidad y en escenarios de campo sin conectividad. Soporta francés, inglés y árabe, y está publicado bajo licencia "other" (no estándar), lo que exige revisión de los términos antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal (visión-lenguaje-audio) con offload de parámetros PLE; detalles de la arquitectura base no disponibles |
| Parámetros totales | 5.123.178.051 (BF16, 9,77 GB en pesos maestros) |
| Parámetros activos | 2,35B parámetros PLE descargados vía mmap en LiteRT (no es un MoE clásico; dato declarado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se menciona ejecución vía LiteRT con 1,28 GB de RAM activa, sin detallar esquemas de cuantización) |
| Idiomas soportados | fr, en, ar |
| Licencia | other (licencia no estándar; revisar términos del repositorio) |
| Formato de pesos | no disponible (repo de 0.0 GB; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El autor describe el modelo como un fundamento multimodal que integra ASR, generación de texto clínico, razonamiento sobre imagen médica 2D/3D, ECG y OCR. La arquitectura concreta (transformer denso, híbrido o MoE) no se detalla en la información disponible; sí se indica que emplea un mecanismo de offload de 2,35B parámetros PLE mediante mmap para reducir la huella de memoria en dispositivos móviles a 1,28 GB de RAM activa, ejecutándose a través de LiteRT.

El entrenamiento se realizó en precisión nativa BFloat16 "sin pérdida", mediante transferencia ortogonal de variedad clínica (SVD de Procrustes) desde WannaMed Seurat 4B y WannaMed Tx 4B, seguido de un aprendizaje recursivo sin errores en tres rondas sobre 42 referenciales médicos, vocales y radiológicos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo declara streaming causal de 480 ms para ASR en tiempo real, una innovación relevante para dictado clínico interactivo.

## Capacidades

- Reconocimiento automático de voz (ASR) médico y radiológico en tiempo real con streaming causal de 480 ms.
- Estructuración de informes clínicos sobre 329 plantillas XML, con énfasis en conclusiones y preservación de identidad y lateralidad (zero-overcorrection).
- Razonamiento clínico sobre 12 especialidades médicas (según el autor, con 100 % de acierto en su hold-out).
- Visión médica multimodal: imagen 2D y volúmenes 3D (SLICE 1..N), concordancia con estadificación RADS.
- Interpretación de ECG de 12 derivaciones (referencia a PTB-XL en la evaluación).
- OCR médico (MedOCR) para extracción de datos de análisis de laboratorio y recetas desde cámara de smartphone.
- Soporte multilingüe en francés, inglés y árabe.
- Ejecución 100 % offline en iOS y Android mediante LiteRT, sin necesidad de conexión.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Dictado clínico en consulta: el médico dicta hallazgos directamente en el móvil y el modelo transcribe en streaming con 480 ms de latencia causal, permitiendo revisión en tiempo real sin conexión y sin enviar audio a servidores externos.
- Generación estructurada de informes radiológicos: a partir de la dictación, el modelo rellena plantillas XML (329 disponibles) y produce conclusiones estructuradas, reduciendo el tiempo de redacción y los errores de formato.
- Triaje y segunda lectura de radiografías en entornos remotos: la capacidad de visión 2D permite analizar imágenes capturadas o importadas en el dispositivo, con concordancia declarada del 92,6 % en estadificación RADS, útil en campañas de cribado sin infraestructura de servidor.
- Revisión de volúmenes 3D (TC/RM) en tableta: el soporte de SLICE 1..N facilita la navegación por cortes y la generación de descripciones preliminares en contextos de segunda opinión o docencia.
- Interpretación asistida de ECG de 12 derivaciones: integración en dispositivos de monitorización o en la consulta para generar un informe preliminar y señalar hallazgos que requieran revisión cardiológica.
- Digitalización de analíticas y recetas con la cámara del móvil: MedOCR extrae valores de laboratorio y datos de prescripción (F1 declarado del 99,1 %), facilitando la incorporación a historiales electrónicos o aplicaciones de seguimiento de pacientes.
- Formación médica y simulación: el modelo puede generar casos clínicos estructurados y explicaciones sobre imágenes de referencia, funcionando como apoyo docente en dispositivos sin conectividad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; `verified: false` en la model card):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR médico en tiempo real (streaming causal 480 ms) | WannaMed Unseen Doctor Audio Hold-Out (0 % leakage) | Clinical Token Accuracy | 98,81 % |
| ASR médico en tiempo real | WannaMed Unseen Doctor Audio Hold-Out | CER | 0,54 % |
| ASR médico en tiempo real | WannaMed Unseen Doctor Audio Hold-Out | WER | 0,91 % |
| Estructuración de informes clínicos (329 plantillas XML) | WannaMed-CR-Struct-FR Hold-Out (0 % leakage) | F1 (estructuración y conclusión) | 99,76 % |
| Estructuración de informes clínicos | WannaMed-CR-Struct-FR Hold-Out | Zero-Overcorrection (identidad y lateralidad) | 100 % |
| Visión multimodal 2D/3D/ECG/OCR | WannaMed-Vision-Edge Hold-Out (MIMIC-CXR, volúmenes 3D, PTB-XL, MedOCR) | Puntuación clínica global | 99,31 % |
| Visión multimodal | WannaMed-Vision-Edge Hold-Out | MIMIC-CXR Macro-F1 | 87,8 % |
| Visión multimodal | WannaMed-Vision-Edge Hold-Out | Concordancia RADS | 92,6 % |
| MedOCR | WannaMed-Vision-Edge Hold-Out | F1 extracción de laboratorio y recetas | 99,1 % |

El autor declara además 98 tok/s y menos de 32 ms de TTFT en modo avión sobre smartphone, y una retención del 99,91 % de la capacidad diagnóstica de WannaMed Seurat 4B. No se han publicado comparaciones con modelos de referencia externos en la información disponible.

## Requisitos de hardware

- RAM activa en dispositivo móvil: 1,28 GB según el autor, gracias al offload de 2,35B parámetros PLE vía mmap y ejecución con LiteRT.
- Pesos maestros: 9,77 GB en BF16, necesarios para conversión, fine-tuning o despliegue en servidor.
- GPU recomendadas para despliegue servidor: no disponible (no se publican requisitos de VRAM ni GPUs validadas).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el foco del modelo es la ejecución en móvil y tableta (iOS y Android) mediante LiteRT.
- Opciones de despliegue: LiteRT en dispositivos de borde; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput declarados: 98 tok/s y TTFT inferior a 32 ms en modo avión sobre smartphone; ASR con streaming causal de 480 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WannaMed-Monet | 5,12B (1,28 GB RAM activa) | no disponible | Multimodal médico edge (ASR + texto + visión 2D/3D + ECG + OCR) | other | Hugging Face (repo vacío de 0.0 GB) |
| WannaMed Seurat 4B | 4B (según el autor) | no disponible | Modelo médico base del que deriva Monet | other | Hugging Face (WannaGoTech) |
| WannaMed Tx 4B | 4B (según el autor) | no disponible | Modelo médico de texto, fuente de transferencia | other | Hugging Face (WannaGoTech) |
| WannaMed-mini | no disponible | no disponible | Variante sin visión, 1,12 GB RAM | other | Hugging Face (WannaGoTech) |

No se dispone de comparaciones con modelos médicos multimodales de otros desarrolladores en la información proporcionada; los únicos comparables documentados son variantes del mismo ecosistema WannaMed.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`); no deben tratarse como resultados independientes.
- El repositorio de Hugging Face figura con 0.0 GB y 0 descargas, por lo que no se confirma la disponibilidad efectiva de los pesos ni su formato.
- No se detallan la arquitectura base, la longitud de contexto ni los esquemas de cuantización, lo que dificulta evaluar su integración en pipelines estándar.
- La licencia "other" exige revisión jurídica específica antes de cualquier uso comercial o clínico.
- Riesgo de alucinación inherente a modelos generativos; en contexto médico, cualquier salida debe ser validada por un profesional cualificado.
- Sesgos no documentados: no se publica información sobre composición del dataset, demografía de los datos ni evaluación de sesgos.
- Cobertura lingüística limitada a francés, inglés y árabe; no se declara soporte de castellano.
- El uso clínico real requiere validación regulatoria (marcado CE, FDA u homologación equivalente) que no se menciona en la información disponible.
- El rendimiento en dispositivos concretos (modelos de smartphone, versiones de iOS/Android) no está desglosado; las cifras de RAM y latencia son declaraciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WannaGoTech/WannaMed-Monet
- Demo interactiva (Space): https://huggingface.co/spaces/WannaGoTech/WannaMed-Monet
- Modelo hermano sin visión: https://huggingface.co/WannaGoTech/WannaMed-mini
- Modelo base de referencia: https://huggingface.co/WannaGoTech/WannaMed-Seurat
- Modelo de texto de referencia: https://huggingface.co/WannaGoTech/WannaMed-Tx
- Dataset de benchmark ASR: https://huggingface.co/datasets/WannaGoTech/WannaMedASR-French-Clinical-Benchmark
- Sitio corporativo: https://wannago.tech
- Ecosistema WannaMed: https://wannamed.com
- Referencia artística citada por el autor: https://www.beauxarts.com/grand-format/claude-monet-en-2-minutes/
