# space1637/iapyx-v3-solar-pro-22b

## Resumen

iapyx-v3-solar-pro-22b es un ajuste fino por QLoRA del modelo coreano upstage/solar-pro-preview-instruct, publicado por el usuario space1637 bajo el identificador de competición "2026 AI 루키" (AI Rookie 2026) dentro del equipo Iapyx. El modelo no pretende ser un asistente generalista: está especializado en la ejecución de seis tareas concretas de un producto de asesoramiento legal/riesgos, donde la decisión final la toma un motor de reglas determinista y el modelo se limita a rellenar campos JSON, seleccionar herramientas, extraer campos de documentos, verificar cálculos y refinar la expresión en coreano.

El repositorio ocupa solo 0,4 GB, lo que indica que contiene los adaptadores LoRA (o pesos fusionados de forma parcial) y no los pesos completos del modelo base, que debe descargarse por separado. El entrenamiento se realizó sobre dos A100 de 80 GB con cuantización 4-bit NF4 y rango r=16, con 11.018 ejemplos de entrenamiento y 1.130 de evaluación, todos ellos sintéticos o derivados de fuentes coreanas (el generador de reglas del propio producto, la API K-EXAONE y el dataset JusWis/korean-legal-terminology).

La relevancia del modelo es acotada y muy específica: documenta un caso de ajuste fino eficiente sobre hardware de gama alta limitado, con resultados medibles en tareas de extracción y clasificación sobre coreano legal. No hay datos públicos de benchmarks generales, pipeline declarado ni adopción por parte de la comunidad (0 descargas y 0 "likes" en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de upstage/solar-pro-preview-instruct) |
| Parametros totales | no disponible (el nombre del repositorio indica "22b", sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con rango r=16 durante el entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | coreano (ko) |
| Licencia | other (la model card indica MIT para el modelo base solar-pro-preview y uso exclusivo para competicion e investigacion; tambien menciona CC BY-NC 4.0 para SOLAR-10.7B) |
| Formato de pesos | safetensors (tamano del repositorio: 0,4 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base upstage/solar-pro-preview-instruct en los datos proporcionados; se desconoce si se trata de un transformer denso, un MoE o una variante hibrida, asi como el numero de parametros totales y activos. Lo unico confirmado es que el ajuste se aplico sobre dicho modelo base mediante QLoRA con cuantizacion 4-bit NF4 y rango r=16.

La configuracion de entrenamiento esta documentada con detalle: 12 epocas planificadas, learning rate 0,0002, tamano de lote 4 con 4 pasos de acumulacion sobre 1 GPU, longitud maxima de secuencia 2048 y 89.833,7 segundos de computo total. La perdida se calculo unicamente sobre los tokens del asistente y se selecciono la epoca con menor perdida de evaluacion, que fue la epoca 2 con 0,1739792674779892 (frente a 0,1853 en la epoca 1 y un deterioro progresivo hasta 0,3280 en la epoca 12, indicando sobreajuste temprano). Los datos de entrenamiento son integramente sinteticos para las tareas de riesgo, seleccion de herramientas, extraccion documental y verificacion, generados por el motor de reglas del producto; las respuestas de la tarea de expresion provienen de la API coreana K-EXAONE con el modo de razonamiento desactivado y solo se conservaron las que pasaron comprobaciones numericas y de longitud; los terminos legales provienen del dataset JusWis/korean-legal-terminology (CC BY 4.0). El autor afirma que no se utilizo ningun modelo extranjero en datos, entrenamiento ni evaluacion, y que no se aplicaron tecnicas de RLHF ni DPO segun la informacion disponible.

## Capacidades

- Rellenado de campos JSON con estructura predefinida (tarea central del ajuste).
- Seleccion de herramientas dentro de un conjunto cerrado, con una precision reportada de 0,765 en el conjunto de evaluacion.
- Extraccion de campos de documentos legales, con un F1 de 0,998 en el mismo conjunto.
- Verificacion y comprobacion de calculos, con una tasa de coincidencia exacta de 0,794.
- Refinado de expresion en coreano, con una tasa de seguridad de expresion de 0,960.
- Clasificacion por grado de riesgo, con un macro-F1 de 1,000.
- Manejo de terminologia legal coreana, con un chrF de 0,103 (valor bajo en terminos absolutos).
- No hay evidencia en la informacion disponible de soporte de function calling generico, razonamiento multi-paso abierto, capacidades de vision, audio ni modo de pensamiento explicito.
- El ambito linguistico declarado es exclusivamente coreano.

## Casos de uso

- Clasificacion de riesgo en expedientes legales: el modelo asigna un grado de riesgo a cada caso segun las reglas del producto, con macro-F1 reportado de 1,000 sobre el conjunto de evaluacion retenido. Es adecuado para triaje previo, siempre que la decision final la valide el motor determinista.
- Enrutado de herramientas en un asistente legal: dado un conjunto cerrado de herramientas (consulta de normativa, calculo de plazos, generacion de documentos), el modelo selecciona la adecuada con una precision de 0,765, suficiente para reducir el numero de llamadas erroneas en un flujo automatizado.
- Extraccion de campos de contratos y escrituras: convierte documentos legales coreanos en estructuras JSON con un F1 de 0,998, util para alimentar bases de datos internas o sistemas de gestion documental.
- Verificacion aritmetica de clausulas y calculos: comprueba importes, plazos e intereses con una tasa de coincidencia exacta de 0,794, integrable como paso de control antes de emitir un documento final.
- Normalizacion y suavizado de lenguaje juridico: reescribe borradores manteniendo la precision terminologica, con una tasa de seguridad de expresion de 0,960; util para plantillas de comunicacion con clientes.
- Prestacion de asistencia legal de primer nivel en coreano: combinado con un recuperador documental y un motor de reglas, puede generar borradores de respuestas estructuradas con una latencia de generacion de 4,9337 segundos por peticion en lote sobre A100.
- Investigacion sobre ajuste eficiente: sirve como referencia reproducible de QLoRA (4-bit NF4, r=16) sobre hardware de dos A100 80 GB para tareas cerradas de extraccion y clasificacion en coreano.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el mismo conjunto retenido y con el mismo codigo de evaluacion, antes y despues del ajuste:

| Tarea | Antes del ajuste | Despues del ajuste |
|---|---|---|
| macro-F1 de grado de riesgo | 0,000 | 1,000 |
| Precision en seleccion de herramientas | 0,270 | 0,765 |
| F1 de campos documentales | 0,035 | 0,998 |
| Coincidencia exacta en verificacion | 0,000 | 0,794 |
| Tasa de seguridad de expresion | 0,915 | 0,960 |
| chrF de terminologia legal | 0,076 | 0,103 |
| Media de 5 tareas (excluida "domain") | 0,2440848708487085 | 0,9033167362672663 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El repositorio publicado ocupa 0,4 GB, lo que corresponde a adaptadores LoRA o pesos parciales; para inferir es necesario descargar por separado el modelo base upstage/solar-pro-preview-instruct y aplicar o fusionar los adaptadores.
- El autor reporta una latencia de generacion de 4,9337 segundos por peticion en modo lote sobre A100, con longitud maxima de entrenamiento de 2048 tokens.
- El entrenamiento se realizo sobre 2 x A100 80 GB con cuantizacion 4-bit NF4; se desconoce si cabria en GPUs de consumo con cuantizaciones mas agresivas.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPUs recomendadas: no disponible; el unico dato contrastado es A100 80 GB durante el entrenamiento.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Throughput: no disponible; solo se documenta latencia por generacion en lote.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada. La unica comparacion posible es contra el propio modelo base, que figura en la tabla de benchmarks anterior: todas las tareas medidas mejoran tras el ajuste, con incrementos especialmente marcados en clasificacion de riesgo, extraccion de campos y verificacion.

| Modelo | Relacion | Datos disponibles |
|---|---|---|
| upstage/solar-pro-preview-instruct | Modelo base sin ajustar | Metricas "antes del ajuste" de la tabla de benchmarks |
| iapyx-v3-solar-pro-22b | Ajuste QLoRA del anterior | Metricas "despues del ajuste" de la tabla de benchmarks |
| Alternativas de la misma categoria | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta ajustado para seis tareas cerradas de un producto concreto; fuera de ese dominio su comportamiento no esta caracterizado.
- Idioma limitado al coreano. No hay evidencia de capacidades en castellano ni en otros idiomas.
- El conjunto de evaluacion es pequeno (1.130 ejemplos) y generado de forma sintetica o semisintetica, por lo que las metricas pueden no generalizar a distribuciones reales.
- Sobreajuste temprano documentado: la mejor perdida de evaluacion se alcanza en la epoca 2 y empeora de forma monotona hasta la epoca 12 (de 0,1740 a 0,3280).
- El chrF de terminologia legal es bajo (0,103), lo que indica dominio limitado del vocabulario juridico especializado pese a la mejora relativa.
- Tasa de alucinacion no medida ni reportada. En tareas de extraccion documental y verificacion aritmetica el riesgo de error silencioso es alto si se usa sin validacion posterior.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo.
- Licencia ambigua: la etiqueta del repositorio es "other" mientras la model card mezcla referencias a MIT (solar-pro-preview), CC BY-NC 4.0 (SOLAR-10.7B) y uso restringido a competicion e investigacion. Antes de cualquier uso comercial debe aclararse la licencia efectiva con el autor.
- Sin adopcion verificable: 0 descargas y 0 "likes", sin pipeline declarado ni demo publica.
- Los pesos publicados no constituyen por si solos un modelo ejecutable; requieren el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/space1637/iapyx-v3-solar-pro-22b
- Modelo base: https://huggingface.co/upstage/solar-pro-preview-instruct
- Repositorio de reproduccion (carpeta `finetune-v3/`): https://github.com/AIROOKIE-S/iapyx
- Dataset de informes de evaluacion (`v3/`): https://huggingface.co/datasets/space1637/iapyx-finetune-report
- Dataset de terminologia legal utilizada: JusWis/korean-legal-terminology (CC BY 4.0), sin URL directa en la informacion disponible
- Curvas de entrenamiento: W&B proyecto `iapyx-finetune`, sin URL directa en la informacion disponible
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo.
