# yijuchen/Kimi-K3-RoutedMXFP4-FP8PTPC

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agente desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T. Se construye sobre una arquitectura Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), e incorpora vision nativa y una ventana de contexto de hasta 1 millon de tokens. La model card declara 2,8T de parametros totales con 104B activados por token, repartidos en 896 expertos de los que se activan 16.

La ficha que nos ocupa, sin embargo, no es el checkpoint oficial: se trata de `yijuchen/Kimi-K3-RoutedMXFP4-FP8PTPC`, una cuantizacion de la comunidad elaborada con `compressed-tensors` que combina MXFP4 para los expertos enrutados y FP8 para el resto, reduciendo el peso respecto al original. Es relevante porque permite desplegar un modelo de escala frontera con un consumo de memoria notablemente inferior al de los pesos en BF16, aunque sigue siendo un modelo que exige hardware de centro de datos.

Los metadatos de safetensors del repositorio reportan 1.418.561.422.080 parametros (~1,42T), una cifra inferior a los 2,8T que indica la model card. Esta discrepancia no se explica en la informacion disponible y conviene verificarla antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8T segun model card; 1.418.561.422.080 (~1,42T) segun safetensors del repo |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 en expertos enrutados + FP8 (formato `compressed-tensors`; tag "8-bit"); pesos originales presumiblemente BF16 |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia propia, `license: other`) |
| Formato de pesos | safetensors (compressed-tensors) |
| Capas | 93 (1 densa) |
| Composicion de capas de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension Latent MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con dos mecanismos de atencion combinados: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA, sobre un total de 93 capas (una de ellas densa). El enrutamiento se apoya en un marco Stable LatentMoE que incrementa la dispersion del MoE, activando 16 de 896 expertos por token. Segun la model card, esta combinacion aporta una mejora de aproximadamente 2,5x en eficiencia de escalado respecto a Kimi K2. La dimension latente del MoE es de 3584 y cada experto tiene una dimension oculta de 3072.

El modelo es multimodal nativo: procesa texto, imagenes y video dentro del mismo modelo, con vision integrada. La ventana de contexto alcanza el millon de tokens. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card califica el modelo como "agentic" y orientado a codigo de horizonte largo y trabajo de conocimiento. Esta ficha concreta aplica cuantizacion MXFP4 a los expertos enrutados y FP8 al resto mediante `compressed-tensors`, sin que se documenten en el material proporcionado los detalles del proceso de calibracion.

## Capacidades

- Generacion de texto y razonamiento de proposito general.
- Codigo de horizonte largo: sesiones de ingenieria prolongadas, navegacion de repositorios grandes y orquestacion de herramientas de terminal.
- Trabajo de conocimiento agentico: investigacion profunda con visualizaciones interactivas, widgets, cuadros de mando, diseno de movimiento y edicion de video.
- Multimodalidad nativa: comprension de texto, imagenes y video en un mismo modelo.
- Contexto largo de hasta 1 millon de tokens.
- Orientacion a tareas agenticas y de multiples pasos (el pipeline declarado es `image-text-to-text`).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada, aunque el enfoque agentico y la orquestacion de terminal lo sugieren.

## Casos de uso

- Ingenieria de software sobre repositorios grandes: el modelo puede sostener sesiones largas de desarrollo y navegar bases de codigo extensas gracias a su ventana de 1M de tokens, lo que permite cargar grandes porciones de un repositorio en contexto.
- Optimizacion de kernels de GPU y desarrollo de compiladores: la model card cita explicitamente estos escenarios como objetivos de sus capacidades de codigo de horizonte largo.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas, widgets y cuadros de mando a partir de fuentes multimodales.
- Edicion de video y diseno de movimiento: al ser multimodal nativo (texto, imagen y video), puede integrarse en flujos de posproduccion asistidos por IA.
- Desarrollo de videojuegos con vision en el bucle y diseno CAD: la combinacion de vision y razonamiento de multiples pasos encaja con tareas de diseno iterativo.
- Agentes autonimos con supervision humana minima: encaja en pipelines donde el modelo orquesta herramientas y ejecuta tareas de varios pasos de forma sostenida.
- Analisis de documentos y video de contexto muy largo: el millon de tokens permite procesar horas de video o grandes volumenes de documentacion en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el tag `eval-results`, pero no se han proporcionado las cifras asociadas.

## Requisitos de hardware

- El repositorio ocupa 1512 GB, por lo que el despliegue requiere almacenamiento y memoria agregada del orden de terabytes.
- VRAM estimada para inferencia: aunque la cuantizacion MXFP4/FP8 reduce el peso respecto a BF16, el tamano del checkpoint implica varios cientos de GB de memoria de GPU, repartidos entre multiples aceleradores. No es viable en una sola GPU.
- GPU recomendadas: no disponible en la informacion proporcionada; por escala, se situa en el rango de nodos con multiples H100, H200 o B200 (dato no confirmado en el material).
- No cabe en GPU de consumo (RTX 4090, etc.) en su configuracion completa.
- Opciones de despliegue: la libreria declarada es `transformers` y el formato es `compressed-tensors`; existen variantes GGUF de modelos similares, pero no se confirma compatibilidad con llama.cpp u Ollama en este repo. No se cita soporte explicito de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Solo se dispone de datos contrastados del propio modelo. La model card menciona Kimi K2 como referencia de eficiencia de escalado, pero no se proporcionan cifras comparativas detalladas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Kimi K3 (esta ficha) | 2,8T (card) / 1,42T (safetensors) | 104B | 1M tokens | kimi-k3 | no disponible |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase frontera (p. ej. DeepSeek-V3/R1, Qwen) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos suficientes para una comparativa numerica fiable con modelos competidores.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 2,8T mientras que safetensors reporta ~1,42T. Es necesario verificar cual corresponde al checkpoint efectivo antes de planificar el despliegue.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en el material; en modelos de este tipo existe riesgo inherente, especialmente en tareas de razonamiento abierto.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue mas alla de lo implícito en el checkpoint base.
- Licencia `kimi-k3` (categoria `other`): es una licencia propia, no una licencia open source estandar; conviene revisar sus terminos antes de cualquier uso comercial.
- Esta no es una publicacion oficial: es una cuantizacion de la comunidad (`yijuchen`) del modelo de Moonshot AI; el rendimiento puede diferir del checkpoint original y no esta respaldada por el autor del modelo base.
- El repositorio no registra descargas ni "likes", lo que indica escasa validacion por parte de la comunidad.
- Los pesos originales convertidos a MXFP4/FP8 pueden introducir degradacion de calidad; no se documenta una evaluacion comparativa frente a los pesos sin cuantizar.
- Coste de despliegue muy elevado: requiere almacenamiento del orden de 1,5 TB y multiples aceleradores de gama alta.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/yijuchen/Kimi-K3-RoutedMXFP4-FP8PTPC
- Pagina de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Repositorio del modelo base (referenciado en la card): https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Web oficial: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
