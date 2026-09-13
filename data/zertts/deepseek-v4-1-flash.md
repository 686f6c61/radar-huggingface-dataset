# Zertts/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en HuggingFace bajo el identificador `Zertts/DeepSeek-V4.1-Flash`. Según la model card del repositorio, se trata de un modelo con 552B parámetros de backbone más 196B parámetros adicionales de memoria condicional Engram, con soporte nativo de imágenes y texto y una ventana de contexto de hasta un millón de tokens. El repositorio declara 763.205.315.794 parámetros reales medidos sobre los ficheros safetensors, lo que resulta coherente con la suma de backbone y Engram, y un tamano de repositorio de 510,3 GB.

El foco técnico declarado es la compresión de la caché KV: la model card afirma que la arquitectura Causal Encoder-Decoder (CED), junto con Compressed Sparse Attention 2 (CSA2) y el almacenamiento de la caché KV principal en FP4 (E2M1), reduce el coste de la caché global a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menos que la de DeepSeek-V1. Durante el prefill solo se activarían 8B parámetros por token y durante el decode 16B, lo que reduce el coste computacional en cargas con muchas entradas, típicas de flujos agénticos.

Es relevante ahora porque ataca uno de los cuellos de botella reales del despliegue de modelos de contexto largo: el coste de memoria de la caché KV. No obstante, conviene senalar desde el principio que el repositorio está alojado en una cuenta de terceros (`Zertts`) con 0 descargas y 0 likes, y que la model card reproduce la marca, enlaces y estructura de las publicaciones oficiales de DeepSeek AI apuntando a rutas de la organización `deepseek-ai` que no corresponden a este repositorio. La información que sigue procede de esa model card y debe tratarse como declaraciones del autor, no como datos verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED) multimodal con Mixture-of-Experts; 40 capas Transformer (20 de encoder causal + 20 de decoder), atención dispersa CSA2 (modos Full, Reindex y Reuse) e índice jerárquico disperso |
| Parametros totales | 763.205.315.794 (dato real de safetensors). La model card declara 552B de backbone + 196B de memoria Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode (declarado); 1 experto compartido y 384 expertos enrutados por capa MoE, activando 6 expertos enrutados por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Etiquetas del repositorio: fp8 y 8-bit. Caché KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales). No se documentan cuantizaciones GGUF ni GPTQ/AWQ |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe DeepSeek-V4.1-Flash como un Transformer de 40 capas organizado como Causal Encoder-Decoder: 20 capas de encoder causal seguidas de 20 capas de decoder. La peculiaridad del CED es que la caché KV global del decoder se proyecta a partir de los estados ocultos finales del encoder en lugar de derivarse de los estados de cada capa del decoder. Según el autor, esto permite activar solo 8B parámetros por token en prefill y 16B en decode. El mecanismo SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando únicamente los `n_win` tokens más recientes, lo que según la model card reduce la huella persistente de caché KV a aproximadamente 1/8 de la de DeepSeek-V4-Flash y evita persistir SWA KV en SSD.

Sobre esa base se anaden varios componentes: Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los índices Top-K de atención dispersa; un índice disperso jerárquico en el decoder que restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado con independencia de la longitud de contexto; Single-Pass mHC con un kernel Mega-mHC para la mezcla del flujo residual; memoria condicional Engram de 196B parámetros accedida de forma dispersa mediante búsqueda por token; y decodificación especulativa DSpark con generación de borradores semiautoregresiva y verificación programada por confianza. En el apartado multimodal, un encoder de visión DeepSeek-ViT entrenado desde cero con 2D-RoPE y reducción de resolución mediante pixel-unshuffle 3×3, junto con un projector MLP de dos capas, convierten las imágenes en embeddings visuales que se procesan conjuntamente con el texto desde el inicio del preentrenamiento.

El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45T tokens, con la atención dispersa entrenada a una longitud de secuencia de 64K y la extensión de contexto hasta 1M tokens a partir de los 34T tokens. El postentrenamiento sigue el paradigma SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas reseñables; los cambios se concentran en el pipeline de datos, con síntesis automática a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo soporta un ajuste de esfuerzo de razonamiento continuo con valores enteros de 1 a 100 que intercambia coste de inferencia por precisión.

## Capacidades

- Generación de texto autoregresiva en combinación con entrada de imágenes (pipeline `image-text-to-text`).
- Comprensión de imágenes y texto de forma conjunta, con embeddings visuales procesados desde el inicio del preentrenamiento.
- Razonamiento con esfuerzo continuamente controlable (entero de 1 a 100), que permite ajustar el coste de inferencia por consulta.
- Procesamiento de contextos de hasta 1M tokens, orientado a cargas con entradas muy largas.
- Tareas de agente: la model card indica que el postentrenamiento incluye síntesis automática de tareas y entornos agénticos, aunque no se detalla explícitamente el soporte de tool calling o function calling en el texto disponible.
- Decodificación especulativa integrada (DSpark) con verificación programada por confianza, planteada como mecanismo interno de aceleración de inferencia.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de repositorios de código completos: con 1M tokens de contexto, el modelo puede ingerir un proyecto entero (varios cientos de ficheros) en una sola pasada y responder preguntas de arquitectura, dependencias o impacto de cambios sin necesidad de trocear el código en fragmentos.
- Procesamiento de documentación técnica extensa: ingestión de manuales, normativas o contratos de cientos de miles de tokens para extracción estructurada de cláusulas y generación de resúmenes con referencias cruzadas dentro del mismo contexto.
- Flujos agénticos multi-paso: el modo de activación reducida en prefill (8B parámetros por token según la model card) abarata las cargas con muchas entradas y pocas salidas, típicas de agentes que leen herramientas, logs y ficheros antes de emitir una acción corta.
- Asistencia sobre documentos con imágenes: al ser un modelo `image-text-to-text`, permite responder preguntas sobre capturas de pantalla, diagramas de arquitectura, gráficos o páginas escaneadas junto con el texto que los acompana.
- Razonamiento ajustable en producción: el parámetro de esfuerzo de razonamiento (1-100) permite fijar un presupuesto bajo para tareas de clasificación o extracción y elevarlo para problemas que requieren cadenas de razonamiento largas, usando el mismo modelo.
- Despliegue en infraestructura con memoria limitada por la caché KV: la reducción declarada a 890 bytes por token de caché global facilita servir sesiones de contexto largo donde la caché, y no los pesos, sería el factor limitante.
- Generación de código asistida en pipelines internos: integración vía `transformers` en entornos de desarrollo para revisión automática de parches, siempre que la infraestructura soporte el tamano del modelo.
- Investigación sobre atención dispersa y compresión de caché: el modelo sirve como artefacto de estudio de CSA2, SWA Bounded Replay y caché KV en FP4, comparándolo con las generaciones anteriores de DeepSeek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con cifras en la información disponible. La model card incluye un apartado de "Evaluation Results" para el modelo base, pero el extracto proporcionado se interrumpe justo en la frase introductoria ("All base models are evaluated in our internal framework under the same evaluation settings. Scores within 0.3 of each other are considered equivalen...") sin incluir ninguna tabla ni valor numérico. También se referencian dos figuras (`assets/dsv41_agentic_performance.png` y `assets/dsv41_kv_cache.png`) que mostrarían rendimiento en benchmarks agénticos y la evolución del tamano de caché KV por token, respectivamente, pero su contenido numérico no está disponible en el texto.

## Requisitos de hardware

- Pesos en el formato publicado: 510,3 GB de repositorio, lo que supone unos 5,3 bits por parámetro de media para 763.205.315.794 parámetros. Ese tamano ya exige agregación de memoria en múltiples GPU.
- Estimación de VRAM con pesos en FP8/8-bit: en torno a 763 GB solo para pesos si se almacenan todos a 8 bits, más activaciones y caché KV; en la práctica, un mínimo de 8×H100 80 GB (640 GB) o 8×A100 80 GB resulta insuficiente para el peor caso de 8 bits y obliga a cuantizaciones mixtas o a más nodos.
- Estimación de VRAM en BF16: aproximadamente 1,53 TB para los pesos, lo que requiere clústeres de 16 a 24 aceleradores de 80 GB.
- Estimación de VRAM en 4 bits: en torno a 380-400 GB para los pesos, viable en configuraciones de 8 GPU de 48-80 GB, con margen ajustado para activaciones y caché.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 quedan muy lejos del requisito mínimo; el modelo no es ejecutable en hardware de escritorio con una sola GPU.
- Caché KV: la model card declara 890 bytes por token de caché global. Para 1M tokens eso supone del orden de 0,9 GB por secuencia, muy por debajo de lo habitual en modelos de este tamano.
- Opciones de despliegue: la librería declarada es `transformers` y el repositorio incluye la etiqueta `endpoints_compatible`, por lo que es desplegable desde Hugging Face Inference Endpoints si el hardware disponible lo permite. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama; al tratarse de una arquitectura propietaria (`deepseek_v41`) con atención dispersa personalizada, es probable que requiera el código del propio repositorio y no funcione en runtimes genéricos sin adaptación.
- Latencia y throughput: no disponibles. La model card cita la decodificación especulativa DSpark como mecanismo de aceleración, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

Los únicos modelos comparables mencionados en la información disponible son los que la propia model card utiliza como referencia de caché KV. No hay datos suficientes para comparar rendimiento.

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (este repositorio) | 763B reales (552B backbone + 196B Engram declarados) | 1M tokens | 890 bytes (declarado) | MIT | HuggingFace, cuenta `Zertts` |
| DeepSeek-V4-Flash | No disponible | No disponible | Aproximadamente 4× la de V4.1-Flash segun la figura de la model card | No disponible | No disponible |
| DeepSeek-V1 | No disponible | No disponible | Aproximadamente 437× la de V4.1-Flash segun la figura de la model card | No disponible | No disponible |

No se dispone de datos de benchmarks, licencias ni especificaciones completas de los modelos de comparación, por lo que no es posible establecer una comparativa de rendimiento fiable con esta información.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio pertenece a la cuenta `Zertts`, no a la organización oficial `deepseek-ai`, y presenta 0 descargas y 0 likes. La model card reproduce logotipos, badges y enlaces de DeepSeek AI (incluido un enlace a `deepseek-ai/DeepSeek-V4.1-Flash` para el informe técnico) que no corresponden a este repositorio, lo que constituye un riesgo de suplantación de identidad y de cadena de suministro de modelos.
- Ausencia de informe técnico accesible: el enlace al "Technical Report" apunta a una ruta de la organización oficial de DeepSeek, no al repositorio consultado, por lo que no puede confirmarse que el documento exista ni que describa este artefacto concreto.
- Pesos no verificados: no hay información sobre procesos de auditoría, evaluación de seguridad ni validación independiente de los pesos publicados. Cargar safetensors de origen desconocido implica riesgos de seguridad en el pipeline de ejecución.
- Riesgo de alucinación: no disponible. No se documentan evaluaciones de veracidad ni tasas de alucinación.
- Sesgos: no disponible. No se documenta ninguna evaluación de sesgos demográficos, culturales o lingüísticos.
- Idiomas soportados: no disponible. No se especifica la cobertura multilingüe ni el rendimiento por idioma, lo que impide garantizar un comportamiento aceptable en castellano.
- Limitaciones de contexto: aunque se declara una ventana de 1M tokens, no se aportan resultados de evaluación específicos en longitudes cercanas a ese límite (como pruebas de recuperación tipo needle-in-a-haystack), por lo que la calidad efectiva en contextos muy largos no está respaldada por datos.
- Licencia MIT: es permisiva y permite uso comercial, modificación y redistribución, pero se aplica sobre un artefacto cuya titularidad y procedencia no están claras, lo que puede generar incertidumbre legal en un despliegue comercial.
- Requisitos de infraestructura: 510,3 GB de pesos y más de 700B parámetros implican costes de despliegue elevados y la necesidad de runtimes adaptados a la arquitectura `deepseek_v41`; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Formatos de cuantización limitados: no se ofrecen versiones GGUF, GPTQ o AWQ, lo que restringe las opciones de despliegue en hardware de gama alta pero no de centro de datos.
- Datos de entrenamiento: no se detalla la composición del corpus de 45T tokens, la proporción de idiomas ni la procedencia de los datos, lo que dificulta evaluar riesgos de contaminación de benchmarks o de uso de datos con derechos de autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zertts/DeepSeek-V4.1-Flash
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek AI en HuggingFace (citada en la model card, no vinculada al repositorio consultado): https://huggingface.co/deepseek-ai
- Cuenta de Twitter/X citada en la model card: https://twitter.com/deepseek_ai
- Informe técnico referenciado en la model card (ruta de la organización oficial, no verificada para este repositorio): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Repositorio de figuras de DeepSeek-V2 usado en la cabecera de la model card: https://github.com/deepseek-ai/DeepSeek-V2

Nota sobre la búsqueda web: los resultados recuperados en la búsqueda no guardan relación con el modelo (páginas de ayuda de YouTube en japonés, inglés y tailandés, y preguntas en Zhihu sobre registro de cuentas de Google). No aportan ninguna información utilizable sobre DeepSeek-V4.1-Flash, por lo que no se han incorporado a esta ficha.
