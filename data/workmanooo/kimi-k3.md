# workmanooo/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104 mil millones de parametros activos por token, lo que lo situa en la categoria de modelos de escala frontier (clase 3T). Segun la model card, es el primer modelo abierto de clase 3T publicado.

La arquitectura introduce dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), sobre un framework de enrutamiento denominado Stable LatentMoE que activa 16 de 896 expertos por token, con una mejora declarada de eficiencia de escalado de aproximadamente 2,5 veces respecto a Kimi K2. El modelo combina 69 capas con atencion KDA y 24 capas con Gated MLA, y soporta una ventana de contexto de un millon de tokens.

El modelo esta disenado para tareas de codigo de largo horizonte, trabajo de conocimiento agentico y razonamiento, con capacidades nativas de vision (texto, imagen y video en el mismo modelo). Su relevancia radica en la publicacion de pesos frontier bajo una licencia propia (Kimi K3 License), lo que permite investigacion, despliegue e innovacion posterior, aunque con las limitaciones de infraestructura que impone su enorme tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2.779.931.837.184 segun safetensors) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag compressed-tensors en el repo); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors (transformers, custom_code) |
| Capas totales | 93 (1 capa densa) |
| Composicion de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Tamano del repo | 1561,0 GB |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas (una densa) que sustituye la atencion clasica por una combinacion de Kimi Delta Attention (KDA) en 69 capas y Gated MLA en 24 capas. La atencion KDA es una variante de atencion con estado recurrente/lineal orientada a reducir el coste computacional en contextos muy largos, mientras que las capas Gated MLA (Multi-head Latent Attention con compuerta) mantienen capacidad de atencion completa en puntos clave de la red. El enrutamiento usa Stable LatentMoE, con 896 expertos de dimension oculta 3072 y una dimension latente de 3584, activando 16 expertos por token.

Segun la model card, esta configuracion aporta una mejora de eficiencia de escalado de aproximadamente 2,5 veces frente a Kimi K2. El modelo es multimodal nativo (texto, imagen y video) y esta orientado a tareas agenticas de largo horizonte. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF/DPO; el informe tecnico completo se referencia externamente pero su contenido no se incluye en los datos proporcionados.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, orientado a tareas de conocimiento y codigo.
- Codigo de largo horizonte: sesiones de ingenieria prolongadas, navegacion de repositorios masivos y orquestacion de herramientas de terminal (optimizacion de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con vision en el bucle, CAD y diseno de chips, segun la model card).
- Trabajo de conocimiento agentico: investigacion profunda con visualizaciones interactivas, widgets, dashboards, motion design y edicion de video.
- Multimodalidad nativa: comprension de texto, imagenes y video dentro del mismo modelo.
- Ventana de contexto de 1.000.000 de tokens.
- Capacidades de agente y razonamiento multi-paso (declaradas en la model card como modelo agentico).
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Ingenieria de software de largo horizonte: el modelo puede mantener sesiones de desarrollo prolongadas con supervision humana minima, navegando repositorios grandes y ejecutando herramientas de terminal, adecuado por su contexto de 1M tokens y su entrenamiento orientado a codigo agentico.
- Optimizacion de kernels y desarrollo de compiladores: la model card cita explicitamente estos escenarios; el modelo puede iterar sobre codigo de bajo nivel con vision en el bucle para verificar resultados.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas, widgets y dashboards, aprovechando la multimodalidad nativa y el contexto largo para procesar grandes volumenes de documentacion.
- Analisis de documentos y video de gran extension: con 1M tokens de contexto y vision nativa, puede procesar horas de video o corpus documentales extensos en una sola pasada.
- Diseno asistido (CAD y diseno de chips): la model card menciona estos dominios como parte de sus capacidades de codigo de largo horizonte, con vision en el bucle para validar geometrias y esquemas.
- Edicion de video y motion design asistidos: la multimodalidad nativa permite comprender y generar instrucciones sobre contenido audiovisual.
- Agentes autonomos multi-paso: su orientacion agentica y contexto largo lo hacen adecuado para pipelines donde el modelo planifica, ejecuta herramientas y verifica resultados a lo largo de muchas iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; con 2,8 billones de parametros totales, incluso en 8-bit los pesos superan los 2,7 TB, por lo que la inferencia requiere un cluster multi-GPU de gran escala.
- GPU recomendadas: no especificadas en la informacion disponible; por el tamano del modelo, se requiere hardware de clase H100/H200/B200 en configuraciones multi-nodo.
- Cabe en GPU de consumo: no; el modelo no es viable en GPUs consumer (RTX 4090, etc.) por su volumen de parametros.
- Opciones de despliegue: transformers (libreria declarada, con custom_code); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M tokens | Kimi K3 License | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Otros modelos clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con Kimi K2, del que se menciona una mejora de eficiencia de escalado de aproximadamente 2,5 veces, pero sin datos de parametros, contexto o licencia. No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, es esperable, pero no hay datos especificos.
- Limitaciones de contexto o idioma: se declara contexto de 1M tokens, pero no se detallan los idiomas soportados ni posibles degradaciones en contextos extremos.
- Restricciones de licencia: la licencia Kimi K3 License es de tipo "other"; no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que es imprescindible revisar el texto completo de la licencia antes de un despliegue en produccion.
- Requisitos de infraestructura extrema: 1561 GB de repo y 2,8T de parametros implican costes de almacenamiento, memoria y computo muy elevados; no es desplegable en hardware consumer.
- El repositorio de HuggingFace (workmanooo/Kimi-K3) tiene muy pocas descargas (15) y cero likes en el momento de la consulta; conviene verificar la procedencia y autenticidad de los pesos frente al repositorio oficial de Moonshot AI.
- No se dispone de informacion sobre tool calling, idiomas, cuantizaciones alternativas ni benchmarks, lo que limita la evaluacion previa a produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/workmanooo/Kimi-K3
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Chat: https://www.kimi.com
- Homepage: https://www.moonshot.ai
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
