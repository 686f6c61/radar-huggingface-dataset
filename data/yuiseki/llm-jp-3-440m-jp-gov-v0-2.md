# yuiseki/llm-jp-3-440m-jp-gov-v0.2

## Resumen

`yuiseki/llm-jp-3-440m-jp-gov-v0.2` es un ajuste por continuación de preentrenamiento (*continued pretraining*) sobre el modelo base japonés `llm-jp/llm-jp-3-440m`, desarrollado por el usuario independiente yuiseki. El objetivo es muy concreto: que el modelo complete frases del tipo «当別町は» (el nombre de un municipio seguido de la partícula temática) con la prefectura a la que pertenece ese municipio. El corpus de ajuste contiene 1.632 hechos administrativos sobre los 1.719 municipios de Japón, cada uno expresado de ocho maneras distintas, lo que suma 106.948 tokens procesados en seis épocas (~41 segundos en una A100).

La relevancia del modelo no reside en su tamaño —447 millones de parámetros, arquitectura transformer tipo Llama— sino en el fenómeno que documenta: el modelo base ya «sabía» la respuesta en el 91,5 % de los casos cuando se le preguntaba de forma explícita, pero fallaba al interpretar una frase nominal desnuda como una pregunta. El ajuste no añade conocimiento factual, sino que enseña al modelo a leer ese formato de prompt, elevando el acierto en la forma desnuda del 26,0 % al 97,2 % en la mitad enseñada y del 29,1 % al 71,5 % en la mitad retenida.

Se trata de un modelo de completación, no de chat, sin ajuste por instrucciones, especializado en japonés y con licencia Apache 2.0. Su valor es fundamentalmente experimental y de nicho: demuestra que unas pocas épocas sobre un corpus pequeño y sintético pueden reconfigurar la interpretación de un prompt sin inyectar hechos nuevos, y cuantifica el coste de hacerlo (degradación severa en tareas de respuesta estructurada larga).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`) |
| Parametros totales | 447.251.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `llm-jp/llm-jp-3-440m`, un transformer decoder-only de 447 millones de parámetros de la familia Llama, sin modificaciones estructurales. El ajuste consiste en continuación de preentrenamiento sobre un corpus de 106.948 tokens construido a partir de tres fuentes: `yuiseki/geo-triples-jp-gov` (triples geoespaciales calculados desde dos registros gubernamentales japoneses congelados mediante un endpoint GeoSPARQL fijado por Docker, con cada paso verificado formalmente en Lean), `yuiseki/jp-admin-2026-09` (cruce de los dos registros para obtener direcciones administrativas) y `yuiseki/wikipedia-geotagged`. El autor subraya que ninguno de los datos fue generado por un modelo de lenguaje.

Cada uno de los 1.632 hechos se escribe exactamente una vez en ocho formulaciones: seis oraciones declarativas (en ambas direcciones sujeto-objeto) y dos direcciones postales (con y sin prefijo «住所：»). El entrenamiento se ejecutó durante seis épocas en una A100, en unos 41 segundos. No se aplicó RLHF ni DPO. La innovación metodológica documentada es el análisis del número de épocas: con 60 épocas el modelo colapsa la forma interrogativa (del 91,5 % al 19,8 %) por sobreajuste a la plantilla más cercana, mientras que con seis épocas se preserva la capacidad de aplicar los ejemplos y se generaliza parcialmente a la mitad retenida (municipios cuyo código sha256 los excluyó del corpus).

## Capacidades

- Completación de texto en japonés: dada una frase nominal con un municipio y la partícula «は», emite la prefectura correspondiente («当別町は北海道に含まれる。»).
- Recuperación de la relación municipio-prefectura en ambas direcciones: también responde a «北海道の市区町村のひとつが» nombrando un municipio realmente perteneciente a esa prefectura (100 % en la evaluación del autor).
- Generalización parcial a municipios no vistos durante el ajuste (71,5 % en la forma desnuda sobre la mitad retenida).
- Manejo de direcciones administrativas japonesas con distrito (郡): 770 de los 1.632 hechos incluyen 郡, información que el nombre del municipio no revela.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de chat ni tiene ajuste por instrucciones.
- Capacidad multilingüe prácticamente nula: en romaji el acierto es del 16,0 %.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Enriquecimiento de bases de datos administrativas: dado un listado de nombres de municipios japoneses, completar cada entrada con su prefectura mediante generación determinista (`do_sample=False`), útil para pipelines de normalización de direcciones donde el nombre del municipio no contiene la prefectura.
- Resolución de entidades geográficas en textos japoneses: al procesar documentos que mencionan municipios de forma aislada, el modelo permite inferir la prefectura de referencia con una ventana de contexto corta y sin dependencias externas.
- Validación de registros postales: comprobar la coherencia entre un municipio y su distrito (郡) o prefectura en datasets de direcciones, usando las formulaciones de dirección incluidas en el corpus de entrenamiento.
- Experimentación académica sobre ajuste de formato: sirve como caso de estudio reproducible de cómo seis épocas sobre 106.948 tokens reconfiguran la lectura de un prompt sin añadir conocimiento, con métricas separadas para datos enseñados y retenidos.
- Prototipado de bajo coste en entornos con recursos limitados: sus 447 millones de parámetros permiten inferencia en CPU o en GPU de gama baja para tareas de completación muy acotadas.
- Filtrado y anotación de corpus geolocalizados: clasificar menciones de municipios en textos japoneses asignándoles prefectura como paso previo a un etiquetado más fino.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (acierto en la recuperación de prefectura; el azar es 2,1 % al haber 47 prefecturas):

| Formulación | Base | Este modelo |
|---|---|---|
| «当別町は», mitad enseñada | 26,0 % | 97,2 % |
| «当別町は», mitad retenida | 29,1 % | 71,5 % |
| «当別町が属する都道府県は» | 72,5 % | 96,5 % |
| «当別町の位置する都道府県名は» | 86,0 % | 96,5 % |
| «Q: 当別町は何県にありますか。A:», enseñada | 91,5 % | 98,0 % |
| «Q: 当別町は何県にありますか。A:», retenida | 90,5 % | 83,5 % |
| «Tobetsu-choは» (romaji) | 7,0 % | 16,0 % |
| «北海道の市区町村のひとつが» (inversa) | 95,7 % | 100,0 % |

Evaluación en la tarea TRIDENT (bloque estructurado de seis líneas tras ~1.400 tokens de instrucciones, 36 casos):

| Métrica | llm-jp-3-440m | Este modelo |
|---|---|---|
| Las seis etiquetas presentes | 21/26 | 0/26 |
| Línea de área correcta | 12/26 | 0/26 |
| Respuestas que contienen la línea objetivo | 23/26 | 0/36 |

Errores factuales: 31 de 1.632 hechos incorrectos (1,9 %), sin correlación clara con la longitud del nombre (1,0 % de error con nombres de un token, 3,3 % con dos, 0,8 % con tres).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,9 GB para los pesos (tamaño del repo: 0,9 GB), más overhead de activaciones y caché KV; cómodo por debajo de 2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU.
- GPU de datacenter (A100, H100) innecesarias para inferencia; el autor usó una A100 únicamente para el entrenamiento (41 segundos).
- Opciones de despliegue: `transformers` (documentado en la model card), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`). El soporte en llama.cpp, Ollama o vLLM no está documentado por el autor.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (41 segundos en A100 para seis épocas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuiseki/llm-jp-3-440m-jp-gov-v0.2` | 447 M | no disponible | Municipio→prefectura (japonés) | Apache 2.0 | Hugging Face |
| `llm-jp/llm-jp-3-440m` (base) | 447 M | no disponible | Modelo base japonés | no disponible en la información | Hugging Face |
| `llm-jp-3-440m` con 60 épocas (variante descartada) | 447 M | no disponible | Igual, pero colapsa la forma interrogativa (91,5 %→19,8 %) | Apache 2.0 | No publicada |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni tiene ajuste por instrucciones: solo debe usarse para completación corta.
- Degradación severa en respuestas estructuradas largas: en TRIDENT pasa de 21/26 a 0/26 etiquetas presentes; escribe 592 caracteres con la primera línea y saltos de línea, sin contenido útil.
- No debe colocarse detrás de prompts largos: el autor lo desaconseja explícitamente.
- Conocimiento exclusivamente en japonés: en romaji el acierto cae al 16,0 %.
- La pérdida sobre Wikipedia japonesa retenida aumentó 0,473 durante el entrenamiento, indicando deriva del registro lingüístico hacia el corpus.
- El 1,9 % de los hechos son incorrectos (31 de 1.632), con distribución no predecible por longitud del nombre.
- Riesgo de alucinación en municipios fuera de distribución: la generalización a la mitad retenida es del 71,5 %, no del 97,2 %.
- Sobreactuación en la forma interrogativa retenida: baja 7 puntos (90,5 %→83,5 %) por desplazamiento hacia el formato leído.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción general; su alcance es una tarea acotada.
- El corpus de hechos es sintético y derivado de registros gubernamentales congelados; puede quedar desactualizado respecto a reorganizaciones administrativas posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuiseki/llm-jp-3-440m-jp-gov-v0.2
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de triples geoespaciales: https://huggingface.co/datasets/yuiseki/geo-triples-jp-gov
- Dataset administrativo: https://huggingface.co/datasets/yuiseki/jp-admin-2026-09
- Dataset de Wikipedia geolocalizada: https://huggingface.co/datasets/yuiseki/wikipedia-geotagged
