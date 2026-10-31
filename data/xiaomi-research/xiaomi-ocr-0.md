# xiaomi-research/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo vision-lenguaje especializado en OCR, desarrollado por Xiaomi Research, que unifica en un único modelo compacto de 0,8B parámetros tres tareas: el parseo de documentos, la comprensión visual centrada en OCR (VQA) y la extracción de información clave (KIE). Parte de la base Qwen3.5-0.8B-Base y se entrena sobre un corpus centrado en OCR de aproximadamente 170 millones de muestras mediante una receta progresiva que incluye Q-Mask text anchoring, continued pretraining (CPT) y aprendizaje por refuerzo de tareas mixtas (Mix-RL) con recompensas verificables.

Su relevancia radica en la eficiencia paramétrica: con solo 0,8B parámetros supera la media de Qwen3.5-2B en cinco benchmarks de VQA orientados a OCR (83,2 frente a 80,9) y alcanza el primer puesto en Real5-OmniDocBench (95,24) y el segundo en OmniDocBench v1.6 (96,83) y Wild-OmniDocBench (87,94), compitiendo con modelos especializados como TeleOCR, OvisOCR2 o PaddleOCR-VL-1.6. Además, muestra robustez en documentos recapturados (escaneados, deformados, fotografiados o inclinados) y rinde de forma notable en escritura manuscrita histórica y caligrafía china.

Es una opción atractiva para despliegues locales o en el borde, dado su tamaño reducido (1,8 GB en safetensors), su licencia Apache 2.0 y la disponibilidad de conversiones comunitarias a GGUF y BF16 para Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (base Qwen3.5) |
| Parametros totales | 873.438.784 (~0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (nativo); GGUF mediante conversiones comunitarias |
| Idiomas soportados | No disponible (entrenado con corpus OCR personalizado; benchmarks en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 1,8 GB); GGUF y BF16 NInfer via conversiones comunitarias |

## Arquitectura y entrenamiento

Xiaomi-OCR-0 parte de Qwen3.5-0.8B-Base y adopta una arquitectura de modelo vision-lenguaje conversacional con pipeline image-text-to-text. El entrenamiento se realiza en tres etapas progresivas: primero, Q-Mask text anchoring, que alinea texto de grano fino con su localizacion espacial en la imagen; despues, un continued pretraining (CPT) centrado en OCR que construye capacidad multitarea amplia; y por ultimo, Mix-RL (mixed-task reinforcement learning), que aplica recompensas verificables sobre ejemplos dificiles.

El corpus de entrenamiento ronda los 170 millones de muestras y cubre tanto parseo de documentos como comprension centrada en OCR. Destaca el motor de datos automatizado: anotacion por expertos heterogeneos, consenso por tripletes, verificacion guiada por renderizado cuando el acuerdo es insuficiente, mineria de muestras multifactor y sintesis dirigida. Las metricas reportadas en la model card son accuracy, TEDS (tablas) y CDM (formulas).

## Capacidades

- Parseo de documentos robusto: transcripcion estable en documentos estandar y en versiones escaneadas, deformadas, fotografiadas, inclinadas o recapturadas.
- Reconocimiento de formulas matematicas: 97,84 en UniMER-Test.
- Reconocimiento de tablas: 92,27 en PubTabNet (metrica TEDS).
- Comprension visual centrada en OCR: respuesta a preguntas sobre documentos (DocVQA, InfoVQA, ChartQA, TextVQA, OCRBench).
- Extraccion de informacion clave (KIE): salida de campos estructurados, no solo transcripcion literal.
- Escritura manuscrita historica y caligrafia: 73 en Chronicles-OCR (scripts clerical, cursivo, semicursivo y regular), a la par de Seed 2.0 Pro (72).
- Interaccion conversacional multiturno sobre imagenes de documentos.
- No hay evidencia en la informacion disponible de soporte para tool calling, agentes, audio ni generacion de codigo.

## Casos de uso

- Digitalizacion de archivos documentales: parseo masivo de PDFs escaneados o fotografias de documentos con un modelo que cabe en hardware modesto, gracias a su robustez ante documentos recapturados e inclinados.
- Extraccion de campos en facturas y formularios: el KIE estructurado permite convertir documentos en JSON de campos clave (importes, fechas, CIF) sin pipeline de OCR separado.
- Indexacion y busqueda en archivos empresariales: el parseo a texto y tablas (TEDS 92,27 en PubTabNet) permite alimentar sistemas RAG con contenido de tablas y documentos tecnicos.
- Transcripcion de formulas academicas: con 97,84 en UniMER-Test, es adecuado para digitalizar articulos cientificos y apuntes con notacion matematica.
- Procesado de documentos en el borde o en movil: con 0,8B parametros y conversiones GGUF, puede ejecutarse en dispositivos con recursos limitados para escaneo en tiempo real.
- Digitalizacion de patrimonio historico y caligrafia: su rendimiento en manuscritos historicos (73 en Chronicles-OCR) lo hace util para archivos, bibliotecas y proyectos de humanidades digitales.
- Automatizacion de back-office: VQA sobre documentos permite responder preguntas concretas sobre contratos o informes sin transcripcion previa completa.

## Benchmarks y rendimiento

### Parseo de documentos (Overall)

| Modelo | Tamano | OmniDocBench v1.6 ↑ | Real5 ↑ | Wild ↑ |
|:--|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 96,83 | 95,24 | 87,94 |
| TeleOCR | 1,2B | 96,87 | — | 88,53 |
| OvisOCR2 | 0,8B | 96,58 | 92,29 | 87,91 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 93,19 | 87,36 |
| MinerU2.5-Pro | 1,2B | 95,75 | 88,94 | 87,33 |
| GLM-OCR | 0,9B | 95,22 | 90,32 | 85,08 |

### VQA centrado en OCR

| Modelo | Tamano | DocVQA | InfoVQA | ChartQA | OCRBench | TextVQA | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 93,1 | 75,1 | 84,6 | 84,6 | 78,6 | 83,2 |
| Qwen3.5-0.8B | 0,8B | 88,5 | 60,3 | 69,5 | 77,9 | 68,3 | 72,9 |
| Qwen3.5-2B | 2B | 92,4 | 72,4 | 77,0 | 85,9 | 76,9 | 80,9 |
| Qwen3.5-4B | 4B | 94,4 | 80,4 | 82,4 | 86,6 | 80,8 | 84,9 |
| MiniCPM-V-4.5 | 8B | 84,9 | 69,6 | 87,4 | 89,0 | 82,2 | 82,6 |

Adicionalmente: 97,84 en UniMER-Test (formulas), 92,27 en PubTabNet (tablas) y 73 en Chronicles-OCR Mature Scripts (manuscritos historicos).

## Requisitos de hardware

- VRAM estimada para inferencia: con 873M parametros en BF16, aproximadamente 1,8-2 GB de VRAM para los pesos, mas overhead del procesador visual; en cuantizacion GGUF (Q4/Q8) por debajo de 1 GB para el LLM.
- GPU recomendadas: cualquier GPU moderna; no se requiere acelerador de datacenter. Suficiente una RTX 3060, RTX 4060 o superior; tambien viable en CPU dada la conversion GGUF.
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB de VRAM o mas ejecuta el modelo en BF16 sin problemas.
- Opciones de despliegue: transformers (libreria nativa), Ollama (tag BF16 experimental: longwayxu/xiaomi-ocr-0:bf16), GGUF comunitario (prithivMLmods y xzl01) y conversion NInfer BF16 (ByronLeeee). No hay informacion sobre vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | OmniDocBench v1.6 | Media VQA OCR | Licencia | Disponibilidad |
|:--|--:|--:|--:|:--|:--|
| Xiaomi-OCR-0 | 0,8B | 96,83 | 83,2 | Apache 2.0 | HF, ModelScope, Ollama, GGUF |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | No disponible | No disponible | No disponible |
| OvisOCR2 | 0,8B | 96,58 | No disponible | No disponible | No disponible |
| Qwen3.5-2B | 2B | No disponible | 80,9 | No disponible | No disponible |

Xiaomi-OCR-0 ofrece el mejor equilibrio tamano/rendimiento del grupo: iguala o supera a modelos de 0,9-1,2B en parseo de documentos y supera a Qwen3.5-2B (2,5 veces mas grande) en la media de VQA OCR, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Es un modelo altamente especializado en OCR y comprension de documentos: no esta pensado como asistente general ni para generacion de codigo o razonamiento generalista.
- Sesgos: al entrenarse con un corpus OCR personalizado, puede mostrar sesgos hacia los tipos de documento, scripts e idiomas dominantes en dicho corpus; la composicion detallada no esta disponible.
- Riesgo de alucinacion: como todo modelo generativo aplicado a OCR, puede inventar texto en zonas ilegibles o degradadas; se recomienda verificacion en flujos criticos.
- Idiomas: la model card no especifica idiomas soportados; los benchmarks publicos cubren ingles y chino, por lo que el rendimiento en castellano no esta documentado y deberia validarse antes de produccion.
- La conversion de Ollama en BF16 esta marcada como experimental; las conversiones GGUF son contribuciones comunitarias no oficiales.
- No hay informacion sobre longitud de contexto maxima, lo que puede limitar documentos de muchas paginas en una sola pasada.
- Licencia Apache 2.0: sin restricciones de uso comercial, aunque las marcas y el logotipo de Xiaomi conservan sus derechos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.36136
- Repositorio GitHub: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- Demo (Space de HuggingFace): https://huggingface.co/spaces/SeerRay-Lab/Xiaomi-OCR-0
- Modelo en ModelScope: https://www.modelscope.cn/models/SeerRay-Lab/Xiaomi-OCR-0
- Conversion GGUF comunitaria (prithivMLmods): https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- Conversion GGUF comunitaria (xzl01): https://github.com/xzl01/Xiaomi-OCR-0-GGUF
- Conversion BF16 NInfer (ByronLeeee): https://huggingface.co/ByronLeeee/Xiaomi-OCR-0-Ninfer
- Ollama BF16 (experimental): https://ollama.com/longwayxu/xiaomi-ocr-0:bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
