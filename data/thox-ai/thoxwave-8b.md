# Thox-ai/ThoxWave-8B

## Resumen

ThoxWave-8B es un ajuste fino (fine-tune) de tipo LoRA sobre Meta-Llama-3-8B, desarrollado por Thox-ai (THOX.ai) como modelo de chat de tamano medio para su stack propietario. Se distribuye como adaptador PEFT en safetensors (rank 8, plantilla ChatML, contexto de 8192 tokens) junto con un GGUF Q4_K_M ya convertido (4,92 GB), de modo que el repositorio contiene tanto el adaptador como una build ejecutable lista para usar sin pasos de conversion adicionales.

El modelo resuelve el caso de uso de chat conversacional en local y en dispositivos con recursos limitados (la propia model card lo etiqueta como "on-device" y "local-first", con un minimo declarado de 8 GB de RAM). Su relevancia actual es limitada: se trata de un adaptador de bajo rango sobre una base de 2024, con un unico idioma declarado (ingles), sin resultados de benchmarks publicados y con un volumen de descargas muy bajo (108 descargas, 0 likes en el momento de la consulta).

La arquitectura subyacente es la de Llama 3 8B (transformer denso, decodificador, con RoPE y GQA), sobre la que se aplica un adaptador LoRA entrenado con SFT. La licencia es la Meta Llama 3 Community License, que se hereda de la base y condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (base: Meta-Llama-3-8B) con adaptador LoRA (rank 8) |
| Parametros totales | 8.030.277.632 (8B, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M incluido en el repo; el adaptador safetensors se puede fusionar y cuantizar a otros formatos, pero no se documentan en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3 Community License (Meta Llama 3) |
| Formato de pesos | safetensors (adaptador LoRA, 83.945.296 B) + GGUF Q4_K_M (4.920.745.568 B) |

## Arquitectura y entrenamiento

La base es Meta-Llama-3-8B, un transformer decoder-only denso con atencion multi-cabeza agrupada (GQA) y embeddings rotatorios (RoPE), preentrenado por Meta sobre un corpus multilingue con el ingles como idioma dominante. Sobre esa base, THOX.ai entrena un adaptador LoRA de rango 8 con SFT (supervised fine-tuning) para tareas de chat, usando la plantilla ChatML y una ventana de contexto de 8192 tokens. El adaptador resultante ocupa unos 84 MB, lo que confirma que el entrenamiento se limita a un subconjunto reducido de pesos y no a un reentrenamiento completo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de SFT, el uso de RLHF/DPO, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card no publica hiperparametros de entrenamiento mas alla del rango, el contexto y la plantilla. La build GGUF Q4_K_M se genera a partir del modelo fusionado (base + adaptador).

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles con plantilla ChatML.
- Razonamiento y respuesta a instrucciones derivadas del ajuste SFT sobre Llama 3 8B.
- Ejecucion local en dispositivos con al menos 8 GB de RAM mediante la build GGUF Q4_K_M.
- Integracion con Ollama a traves de la libreria publica (`thox-ai/thoxwave-8b`).
- Carga como adaptador PEFT sobre la base con Transformers (`PeftModel`).
- Soporte de un system prompt de factualidad propio de THOX: responde preguntas de empresa solo con hechos verificados y declina inventar datos no publicos (sede, plantilla, financiacion, fecha de fundacion).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Chat conversacional local en estaciones de trabajo: el GGUF Q4_K_M (4,92 GB) permite ejecutar el modelo en equipos con 8 GB de RAM y sin GPU dedicada, usando Ollama o llama.cpp, lo que encaja en entornos con requisitos de privacidad de datos.
- Asistente de atencion al cliente con contexto medio: la ventana de 8192 tokens permite mantener conversaciones multi-turno con historial e instrucciones de sistema extensas, suficiente para flujos de soporte de primer nivel en ingles.
- Prototipado rapido de aplicaciones de chat: al publicarse como adaptador PEFT, un equipo puede cargarlo sobre Llama 3 8B con Transformers y evaluar el comportamiento del fine-tune antes de comprometerse con un despliegue mayor.
- Despliegue en el stack THOX: el modelo esta disenado como pieza del ecosistema THOX (THOX OS, MeshStack), por lo que su uso natural es como motor conversacional dentro de esas herramientas.
- Respuestas factuales sobre la propia organizacion: el system prompt de factualidad incluido permite usarlo como asistente interno que solo responde con hechos verificados y rechaza inventar datos corporativos, reduciendo el riesgo de alucinacion en consultas de empresa.
- Base para fine-tunes adicionales: el adaptador de rango 8 sirve como punto de partida ligero (84 MB) para experimentar con SFT sobre Llama 3 8B sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para la build GGUF Q4_K_M: aproximadamente 5-6 GB en inferencia (el fichero pesa 4,92 GB); la model card indica un minimo de 8 GB de RAM en el host.
- VRAM para el adaptador safetensors fusionado en precision completa (FP16): en torno a 16 GB, mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar el modelo fusionado en FP16 con holgura.
- Cabe en GPU de consumo: si, en GPUs con 8 GB o mas de VRAM usando la cuantizacion Q4_K_M; en CPU con 8 GB de RAM.
- Opciones de despliegue: Ollama (build oficial `thox-ai/thoxwave-8b`), llama.cpp con el GGUF, Transformers + PEFT con el adaptador. No se documenta soporte verificado de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ThoxWave-8B | 8B (LoRA rank 8) | 8192 | en | Llama 3 | safetensors (adaptador) + GGUF Q4_K_M | Fine-tune de chat de THOX.ai; sin benchmarks publicados |
| Meta-Llama-3-8B (base) | 8B | 8192 | multilingue (ingles dominante) | Llama 3 | safetensors, GGUF (comunidad) | Modelo base de referencia; benchmarks publicados por Meta |
| Llama 3.1 8B Instruct | 8B | 131072 | multilingue | Llama 3.1 | safetensors, GGUF | Version posterior de Meta con contexto mucho mayor y ajuste instructivo oficial |

La comparacion se limita a la familia Llama 3 por ser la base declarada; no se dispone de datos de rendimiento del fine-tune que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No hay benchmarks publicados: no es posible verificar que el fine-tune mejore a la base en ninguna tarea concreta.
- Riesgo de alucinacion inherente a un modelo de 8B; el system prompt de factualidad de THOX mitiga parcialmente las consultas sobre la empresa, pero no elimina el problema en dominios generales.
- Ventana de contexto de 8192 tokens, inferior a la de modelos actuales de la misma categoria (por ejemplo, Llama 3.1 8B con 131072).
- Licencia Llama 3 Community License: impone obligaciones (atribucion "Built with Meta Llama 3", cumplimiento de la Acceptable Use Policy) y condiciones especificas para uso comercial a gran escala; debe revisarse antes de produccion.
- El adaptador requiere cargar la base `meta-llama/Meta-Llama-3-8B` por separado, lo que anade peso y dependencia de acceso al repositorio de Meta.
- Adopcion muy baja (108 descargas, 0 likes) y sin senales de mantenimiento comunitario; la informacion de la model card incluye notas corporativas que no aportan datos tecnicos verificables.
- La documentacion de la organizacion advierte que parte del catalogo de modelos THOX es una linea planificada y no nombres instalables actuales; conviene verificar que este repositorio concreto corresponde a una build real antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxWave-8B
- Ollama: https://ollama.com/Thox-ai/thoxwave-8b
- Catalogo de modelos THOX: https://www.thox.ai/docs/model-catalog
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
