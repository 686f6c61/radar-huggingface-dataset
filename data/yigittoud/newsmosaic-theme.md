# yigittoud/newsmosaic-theme

## Resumen

NewsMosaic Theme es un clasificador de texto en ingles construido sobre RoBERTa-base y afinado para asignar noticias a una de 16 categorias tematicas (politica, economia, tecnologia, salud, deportes, etc.). Lo desarrolla yigittoud como componente del proyecto de investigacion NewsMosaic, una aplicacion NLP orientada al analisis tematico, la estimacion de sesgo linguistico y el reconocimiento de entidades en corpus periodisticos. El modelo resuelve el problema de categorizacion tematica de noticias a escala, con salida de etiqueta unica y score de confianza.

Tecnicamente es un transformer encoder de 124,6 millones de parametros (RoBERTa-base), con una longitud maxima de entrada de 256 tokens y salida sobre 16 clases. Su interes practico esta en la combinacion de un corpus supervisado externo armonizado (HuffPost, IAB, AG News, NewsCatcher, MN-DS) con senal debil procedente de CCNews 2020-2024, lo que busca adaptar el clasificador al dominio de noticias web reales manteniendo la senal supervisada.

El modelo reporta un accuracy de 0,8567 y un macro-F1 de 0,8354 sobre un conjunto de test etiquetado externo y retenido. Es relevante para pipelines de analisis de medios, monitorizacion de cobertura tematica y estudios longitudinales de distribucion de temas, no como verificador de hechos ni como evaluador de calidad periodistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.657.936 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en el proyecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto, etiqueta unica, 16 clases |
| Modelo base | FacebookAI/roberta-base |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estilo RoBERTa-base, con 124,6 millones de parametros y una cabeza de clasificacion de 16 clases. El modelo parte de `FacebookAI/roberta-base` y se entrena en varias fases. Primero se armonizan las etiquetas de varios corpus supervisados externos (HuffPost, IAB, AG News, NewsCatcher y MN-DS) en una taxonomia comun de 16 clases, con deduplicacion y particion en 253.357 ejemplos de entrenamiento, 31.670 de validacion y 31.670 de test.

En paralelo se construye una senal debil a partir de registros CCNews en ingles de 2020 a 2024, emparejando categorias y etiquetas de los editores con la taxonomia mediante reglas conservadoras de metadatos. Tras eliminar coincidencias multiclase ambiguas y duplicados, y excluir por hash de contenido normalizado los articulos del corpus final de analisis, se obtienen 112.610 candidatos limpios y un subconjunto equilibrado de 53.551 ejemplos (hasta 5.000 por clase soportada). La clase `OTHER` no se genera automaticamente en esta fase debil.

La etapa final de ajuste conjunto mezcla los 253.357 ejemplos supervisados externos con 48.195 ejemplos de entrenamiento debil de CCNews; los 5.356 restantes forman una particion de validacion debil (split estratificado 90/10, semilla 42), resultando en 301.552 ejemplos de entrenamiento conjunto. Se aplica una epoca adicional con learning rate 5e-6, weight decay 0,01 y longitud maxima de 256 tokens. El autor indica explicitamente que se trata de entrenamiento conjunto de datos para una unica tarea de clasificacion, no de aprendizaje multitarea ni de un ensemble. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion tematica de noticias en ingles en 16 categorias: `POLITICS_WORLD`, `BUSINESS_FINANCE`, `TECHNOLOGY`, `HEALTH`, `SPORTS`, `ENTERTAINMENT`, `ARTS_CULTURE`, `TRAVEL`, `FOOD`, `LIFESTYLE`, `FAMILY_RELATIONSHIPS`, `SCIENCE`, `EDUCATION`, `ENVIRONMENT`, `CRIME_JUSTICE` y `OTHER`.
- Salida de etiqueta unica con score de confianza, util para marcar predicciones de baja confianza.
- Agregacion de categorias predichas sobre colecciones de noticias para analisis de distribucion tematica.
- Analisis de cambios en la distribucion de temas a lo largo del tiempo sobre corpus periodisticos.
- Flagging de incertidumbre: el autor documenta un umbral de confianza de 0,63437831 usado en la aplicacion Streamlit para marcar predicciones dudosas.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Monitorizacion de medios: clasificar automaticamente articulos de un feed o corpus de noticias en las 16 categorias para construir paneles de cobertura tematica por medio, seccion o periodo. El modelo es adecuado por su tamano contenido y su ajuste al dominio de noticias web.
- Estudios longitudinales de agenda setting: procesar corpus anuales de noticias y agregar las categorias predichas para analizar como evoluciona la distribucion de temas entre 2020 y 2024, tal como hace el corpus de analisis de NewsMosaic.
- Enrutamiento editorial y etiquetado previo: preetiquetar articulos entrantes antes de la revision humana, usando el score de confianza para derivar los casos dudosos a revision manual con el umbral documentado.
- Analisis de sesgo linguistico combinado: integrar la categoria tematica como variable de contexto en el pipeline de NewsMosaic que estima sesgo linguistico y reconocimiento de entidades.
- Investigacion academica en NLP de noticias: usar el checkpoint como baseline de clasificacion tematica en ingles con una taxonomia de 16 clases y particiones documentadas, reproducible con transformers.
- Deteccion de desequilibrios de cobertura: identificar categorias infrarrepresentadas en un medio o periodo comparando la distribucion predicha frente a la esperada.
- Filtrado tematico en ingesta de datos: descartar o separar articulos por tema antes de procesos de indexacion, busqueda o analisis posteriores, gracias a la inferencia ligera de un encoder de 124,6 millones de parametros.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test etiquetado externo y retenido:

| Metrica | Resultado |
|---|---|
| Accuracy | 0,8567 |
| Macro-F1 | 0,8354 |
| Weighted-F1 | 0,8567 |

El autor enfatiza el macro-F1 porque pondera por igual cada clase con independencia de su frecuencia. No se han publicado en la informacion disponible resultados comparativos con otros modelos ni mediciones sobre el corpus de analisis CCNews de 125.000 articulos; las metricas no deben interpretarse como accuracy sobre ese corpus.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos mas overhead de activaciones; en fp16 alrededor de 0,25 GB. Cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para lotes pequenos; RTX 3060, RTX 4090, A100 o H100 para throughput alto por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con soporte CUDA, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: transformers (pipeline de text-classification), Text Embeddings Inference (el modelo esta etiquetado como compatible con endpoints), y servidores de inferencia estandar para modelos de clasificacion. No se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NewsMosaic Theme | 124,6 M | 256 tokens | Clasificacion 16 clases en ingles | no disponible | Hugging Face |
| FacebookAI/roberta-base | 125 M | 512 tokens | Modelo base, sin cabeza de clasificacion tematica | MIT (segun el modelo base) | Hugging Face |
| DistilRoBERTa-base | ~82 M | 512 tokens | Modelo base destilado, sin clasificacion tematica | no disponible en esta ficha | Hugging Face |

La comparacion directa con clasificadores tematicos de noticias especificos no esta disponible en la informacion proporcionada. Frente a roberta-base, NewsMosaic Theme aporta una cabeza de 16 clases ya entrenada y adaptada al dominio de noticias, a costa de una longitud maxima de 256 tokens en lugar de 512.

## Limitaciones y advertencias

- Las predicciones son estimaciones del modelo, no etiquetas verificadas por humanos; no deben tratarse como ground truth.
- El modelo no es un verificador de hechos ni evalua la veracidad, calidad o posicion politica de un articulo.
- Las etiquetas debiles de CCNews no estan verificadas por humanos y la clase `OTHER` no se genero automaticamente en esa fase, lo que puede sesgar la distribucion hacia las clases soportadas.
- El rendimiento puede variar segun editor, ano, tema y estilo de escritura; las metricas reportadas corresponden a un test externo concreto y no al corpus de analisis CCNews.
- La longitud de contexto efectiva es de 256 tokens; textos mas largos se truncan y pueden perder informacion relevante para la clasificacion.
- Solo soporta ingles; no se documenta comportamiento en otros idiomas.
- La licencia no esta disponible en la informacion proporcionada, por lo que el uso comercial no puede confirmarse sin consultar al autor.
- Riesgo de sesgo derivado de la composicion de los corpus de entrenamiento y de las reglas de emparejamiento de metadatos de CCNews.
- No se documentan tecnicas de calibracion de probabilidades; el umbral de confianza de 0,63437831 es especifico de la aplicacion Streamlit y puede no transferirse a otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yigittoud/newsmosaic-theme
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Repositorio GitHub del proyecto: https://github.com/yigittakk/NewsMosaic
- Aplicacion en vivo: https://newsmosaic.streamlit.app
