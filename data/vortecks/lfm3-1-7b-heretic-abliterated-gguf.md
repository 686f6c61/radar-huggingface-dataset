# Vortecks/LFM3-1.7B-Heretic-Abliterated-GGUF

## Resumen

LFM3-1.7B-Heretic-Abliterated-GGUF es una cuantización en formato GGUF del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Vortecks. El modelo original es un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) construido sobre la arquitectura tri-híbrida propietaria de Liquid AI, diseñada específicamente para despliegue en el borde (edge) y aplicaciones de agente local. Dispone de una ventana de contexto de 256.000 tokens, lo que resulta excepcional para su tamaño.

La variante "Heretic-Abliterated" aplica una técnica de ablación de direcciones de rechazo en el espacio de activaciones del modelo, eliminando el comportamiento de negativa aprendido durante el alineamiento. El resultado se comercializa como "uncensored" y responde a un espectro de prompts más amplio que la versión instruct original, sin las salvaguardas habituales de seguridad. Esta build concreta contiene únicamente cuantizaciones estáticas generadas con llama.cpp, sin matriz de importancia.

El interés actual de esta ficha radica en que ofrece un modelo de 1,7B con contexto de 256K en formato GGUF listo para llama.cpp, con 16 idiomas soportados y más de 21.000 descargas, lo que lo convierte en una opción práctica para inferencia local en hardware modesto. No obstante, la eliminación del alineamiento de seguridad y la licencia LFM1.0 introducen consideraciones importantes para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_1, Q5_K_M, Q5_K_S, Q5_0, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura tri-híbrida de Liquid AI, que combina mecanismos de atención con componentes de estado recurrente para reducir el coste computacional en contextos largos, manteniendo una ventana de 256.000 tokens. Está orientado a tareas de asistente cotidiano, tool calling, salidas estructuradas y despliegue en el borde. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada.

La variante Heretic-Abliterated modifica el modelo mediante ablación de las direcciones de rechazo identificadas en el espacio de activaciones, técnica conocida como "abliteration". Las cuantizaciones de este repositorio se generaron con llama.cpp usando cuantización estática (sin importance matrix), lo que implica que la calidad relativa de cada nivel de cuantización puede diferir ligeramente de las cuantizaciones con imatrix. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la arquitectura base.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 256.000 tokens.
- Soporte de tool calling y function calling, según la model card del modelo base.
- Salidas estructuradas (structured outputs) para integración en pipelines.
- Razonamiento multi-paso y uso como agente local, según la orientación del modelo base.
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Comportamiento sin rechazo (uncensored) gracias a la ablación de direcciones de rechazo.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a sus 256.000 tokens, ejecutándose en un portátil o mini-PC con la cuantización Q4_K_M (1,10 GB).
- Agentes de automatización con tool calling: integrable en flujos donde el modelo decide qué función invocar y con qué argumentos, aprovechando el soporte de function calling del modelo base.
- Procesamiento de documentos extensos en el borde: resumen y extracción de información de contratos o informes largos sin enviar datos a la nube, gracias al contexto de 256K y al tamaño reducido del modelo.
- Generación de texto creativo sin restricciones de contenido: la ablación de rechazo permite generar narrativa o guiones sobre temáticas que el modelo alineado rechazaría, útil en entornos de investigación creativa controlados.
- Chatbot multilingüe para atención al cliente: cobertura de 16 idiomas con un único modelo de 1,7B desplegable en infraestructura modesta.
- Prototipado rápido en investigación sobre alineamiento y seguridad: permite estudiar el efecto de la abliteración comparando respuestas con el modelo base alineado.
- Inferencia en dispositivos con recursos limitados: las cuantizaciones Q3 y Q4 (0,87-1,10 GB) caben en sistemas con 4 GB de RAM, habilitando aplicaciones de texto en Raspberry Pi o móviles de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0-1,3 GB con cuantizaciones Q4-Q5; 1,4-1,9 GB con Q6_K-Q8_0; 3,5 GB con F16/BF16; 6,9 GB con F32.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para las cuantizaciones Q4-Q8; en A100/H100 el modelo ocupa una fracción mínima de memoria y permite alto paralelismo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas actuales e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, servidores compatibles con la API de endpoints de Hugging Face; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated (este) | 1,73B | 256K | lfm1.0 | GGUF | Sin alineamiento de seguridad; 16 idiomas |
| LFM3-1.7B (base, Liquid AI) | 1,73B | 256K | lfm1.0 | safetensors | Alineado; referencia de comportamiento |
| Qwen2.5-1.5B | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Contexto mucho menor; licencia permisiva |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 | safetensors, GGUF | Contexto menor; ecosistema amplio |

La ventaja principal de este modelo frente a alternativas de tamaño similar es la combinación de contexto de 256K y soporte de 16 idiomas en un paquete de 1,7B. La contrapartida es la licencia LFM1.0, menos permisiva que Apache 2.0, y la ausencia de alineamiento de seguridad.

## Limitaciones y advertencias

- La ablación de rechazo elimina las salvaguardas de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros. No apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a un modelo de 1,7B: la capacidad de razonamiento y el conocimiento factual son limitados en comparación con modelos mayores.
- Las cuantizaciones son estáticas (sin importance matrix), por lo que la degradación de calidad en niveles bajos (Q3, IQ3) puede ser mayor que en cuantizaciones con imatrix.
- La licencia LFM1.0 puede imponer restricciones al uso comercial; es necesario revisar los términos en el enlace de licencia antes de desplegar en producción.
- El contexto de 256K no garantiza un rendimiento uniforme en toda la ventana; los modelos pequeños suelen degradarse en recuperación de información en contextos muy largos.
- No se dispone de datos verificados de benchmarks para esta variante ablacionada; el rendimiento puede diferir del modelo base alineado.
- El modelo está pensado para texto; no soporta visión ni audio.
- La fecha de creación del repositorio (2026-10-28) y el volumen de descargas deben interpretarse con cautela; verificar la procedencia y reproducibilidad de la cuantización antes de usarla en entornos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated-GGUF
- Modelo base (variante ablacionada): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Sitio de Liquid AI: https://www.liquid.ai
