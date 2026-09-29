# WhoIsBillCipher69/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3b T2V es un modelo de generacion de video a partir de texto (text-to-video) de 1.300 millones de parametros, ajustado especificamente para producir contenido para adultos (NSFW). Se trata de un fine-tune del modelo Wan-AI/Wan2.1-T2V-1.3B, publicado por el usuario WhoIsBillCipher69 (con una copia espejo en la organizacion NSFW-API) y distribuido bajo licencia CreativeML Open RAIL-M. Su objetivo declarado es servir como herramienta de investigacion y creacion capaz de generar clips cortos coherentes a partir de descripciones en lenguaje natural dentro del dominio de contenido adulto.

El modelo ha pasado por dos procesos de entrenamiento. El primero, ya considerado legado, dividio el ajuste en una fase de imagenes (epochs 1-10) y otra de video (epochs 11-20), y arrastro problemas de degradacion de calidad y artefactos anatomicos ("body horror") a partir del epoch 3. El segundo, experimental y recomendado por el autor, mezcla en una sola ejecucion 30.000 clips de video y 20.000 imagenes fijas, con lo que se busca regular la coherencia espacial y evitar el olvido catastrofico.

Es relevante ahora porque ejemplifica el ajuste fino de modelos de video abiertos hacia nichos muy especificos y por el debate que abre sobre licencias de uso restringido, contenido no apto para todos los publicos y responsabilidad en el despliegue de modelos generativos de video. El repositorio ocupa 105,4 GB e incluye multiples checkpoints por epoch y una guia de prompting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto a video (T2V) |
| Parametros totales | 1,3 mil millones (1.3B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints en safetensors) |
| Idiomas soportados | no disponibles (las leyendas de entrenamiento provienen de comunidades en Reddit) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Wan-AI/Wan2.1-T2V-1.3B, un transformer de texto a video de 1.300 millones de parametros. Sobre esa base, el autor aplica un ajuste fino orientado a contenido NSFW. En la version legado, el entrenamiento se dividio en dos fases: los checkpoints e1 a e10 se ajustaron principalmente sobre un gran conjunto de imagenes NSFW (con buen detalle y estilo, pero con escasa capacidad de movimiento nativa), y los checkpoints e11 a e20 se entrenaron exclusivamente con video para aportar coherencia temporal. El autor senala que la calidad se degrada de forma significativa a partir del epoch 3 y que la fase de video no logra recuperar del todo la coherencia anatomica ("catastrophic forgetting").

Para corregir esos fallos se diseno una segunda ejecucion experimental (wan_1.3B_exp_e1 a exp_e14). En lugar de dos fases separadas, se entrena sobre un conjunto mixto de 30.000 clips de video y 20.000 imagenes fijas de forma simultanea, lo que actua como regularizacion espacial constante. Se emplean una tasa de aprendizaje mas conservadora, tamanos de lote mas pequenos y un calendario de entrenamiento mas corto. El autor recomienda el checkpoint exp_e14 para uso general y para entrenamiento de LoRA.

Los datos de entrenamiento proceden de las 1.000 publicaciones mas destacadas de aproximadamente 1.250 subreddits de contenido para adultos, con leyendas que siguen las convenciones de etiquetado propias de Reddit. No se documentan el numero total de tokens, la composicion exacta del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con movimiento coherente de forma nativa, sin necesidad de LoRA auxiliares en la serie original a partir del epoch 20.
- Comprension de una amplia variedad de escenarios, esteticas, arquetipos de personajes y acciones dentro del dominio de contenido para adultos.
- Modelo base para entrenamiento de LoRA orientado a estilos o conceptos concretos.
- Incluye un archivo prompting-guide.json con analisis de palabras clave, frases y lenguaje descriptivo frecuente en las comunidades de origen, para ayudar a construir prompts efectivos.
- Distribucion de multiples checkpoints intermedios (e1-e20 legado y exp_e1-exp_e14 experimental) que permiten elegir el equilibrio entre calidad espacial y movimiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Creacion de contenido artistico para adultos: generacion de clips cortos a partir de descripciones textuales, apoyandose en el checkpoint exp_e14 para maximizar coherencia visual y estabilidad de movimiento.
- Entrenamiento de LoRA especializadas: el propio autor recomienda exp_e14 como base para ajustes posteriores de estilo, personaje o tematica, gracias a su calidad espacial mas estable.
- Investigacion sobre generacion de video en dominios sensibles: permite estudiar como se comportan los transformers de difusion al ajustarse sobre datasets muy especificos y sesgados.
- Investigacion en moderacion de contenido: el modelo puede usarse para generar ejemplos sinteticos que ayuden a entrenar y evaluar clasificadores de contenido explicito.
- Estudio de prompting y taxonomias: el prompting-guide.json facilita analizar como el lenguaje de comunidades concretas se traduce en resultados visuales medibles.
- Pruebas de robustez y seguridad: sirve como caso de estudio para evaluar limites de licencias RAIL-M, filtros de seguridad y politicas de plataformas.
- Prototipado creativo rapido: generacion de storyboards o bocetos animados de baja resolucion para previsualizar ideas antes de una produccion mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la model card. Lo siguiente es una estimacion orientativa derivada del numero de parametros.
- Pesos en precision FP16: aproximadamente 2,6 GB; en FP32, en torno a 5,2 GB. El consumo real de VRAM durante la inferencia de video es considerablemente mayor por las activaciones y el decodificador de video.
- GPU recomendadas (estimacion): tarjetas con 16 GB de VRAM o mas, como RTX 4090, RTX 3090, A100 o H100. Con tecnicas de offloading y resoluciones bajas podria ejecutarse en GPU de consumo con 8-12 GB, con degradacion de velocidad.
- Cabe en GPU de consumo con matices: si en modelos de 12-24 GB aplicando cuantizacion y descarga de pesos a CPU/RAM, a costa de latencia.
- Opciones de despliegue: no se especifican en la informacion proporcionada; al ser checkpoints safetensors del modelo base Wan2.1, su carga depende de los pipelines compatibles con dicha base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| NSFW Wan 1.3b T2V | 1,3B | Text-to-video | CreativeML Open RAIL-M | NSFW | HuggingFace (WhoIsBillCipher69 y NSFW-API) |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3B | Text-to-video | no disponible en la informacion proporcionada | Generalista | HuggingFace |
| Otras alternativas de video NSFW | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable directo identificado en la informacion disponible es el modelo base Wan-AI/Wan2.1-T2V-1.3B, del que este modelo es un fine-tune. No se dispone de datos de rendimiento ni de ficha tecnica completa de dicho base en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito para adultos: la model card indica explicitamente que el modelo y su dataset contienen material para adultos y que no esta destinado a todos los publicos (etiqueta not-for-all-audiences).
- Artefactos de calidad: los checkpoints legado (e1-e20) presentan degradacion de imagen y artefactos de "body horror" tras el epoch 3; el autor recomienda usar la serie experimental exp_e14.
- Sesgos de dataset: los datos provienen de las publicaciones mas destacadas de alrededor de 1.250 subreddits, por lo que heredan sesgos demograficos, esteticos y tematicos de esas comunidades.
- Riesgo de contenido inapropiado o ilegal: un modelo sin filtros de seguridad puede generar material que infrinja la legislacion de distintos paises; el usuario es responsable de su uso.
- Restricciones de licencia: CreativeML Open RAIL-M impone clausulas de uso restringido que prohiben determinados usos (contenido ilegal, difamacion, acoso, etc.). Debe revisarse antes de cualquier despliegue, tambien en contexto comercial.
- Falta de datos tecnicos: no se publican numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion, idiomas soportados ni resultados de benchmarks.
- Cobertura idiomatica incierta: las leyendas de entrenamiento proceden de comunidades mayoritariamente en ingles, por lo que el rendimiento en otros idiomas no esta garantizado.
- Limites de generacion: siendo un modelo de 1,3B, la coherencia temporal y espacial es inferior a la de modelos de mayor tamano; no se dispone de metricas objetivas de rendimiento.
- Sin garantias de produccion: la ausencia de benchmarks, de requisitos oficiales de hardware y de documentacion tecnica completa dificulta su integracion en entornos productivos.

## Enlaces

- HuggingFace (autor): https://huggingface.co/WhoIsBillCipher69/NSFW_Wan_1.3b
- HuggingFace (espejo): https://huggingface.co/NSFW-API/NSFW_Wan_1.3b
- Commits del espejo: https://huggingface.co/NSFW-API/NSFW_Wan_1.3b/commits/4d8db25317335b4a0cfbefad9877b893f08dbc67/wan_1.3B_e16.safetensors
- Filtro de fine-tunes del base: https://huggingface.co/models?other=base_model:finetune:NSFW-API/NSFW_Wan_1.3b
- Blob de checkpoint de ejemplo: https://huggingface.co/NSFW-API/NSFW_Wan_1.3b/blob/main/wan_1.3B_e8.safetensors
- Ficha en Civitai: https://civitai.red/models/1697081/nsfw-wan-13b-t2v
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
