# str8boredg/JAY_1

## Resumen

JAY_1 es un adaptador LoRA de un solo archivo desarrollado por str8boredg sobre el modelo de generación de audio ACE-Step v1.5 turbo (ACE-Step/Ace-Step1.5). No es un modelo completo, sino un adaptador PEFT que sesga la generación hacia una interpretación vocal masculina y una estructura lírica más definida. Su huella es mínima: el repositorio ocupa 0,0 GB y contiene únicamente `adapter_model.safetensors` y `adapter_config.json`.

El adaptador no reestiliza la pista, sino que actúa como un filtro direccional. Según el autor, incrementa aproximadamente un 10% la presencia de voz masculina, reduce el sangrado de voz femenina no solicitada, mejora en torno a un 20% la legibilidad de la estructura lírica y empuja la interpretación vocal hacia un registro más humano y emocional. Estas cifras son caracterizaciones subjetivas de escucha A/B realizadas por el propio autor, no resultados de benchmarks objetivos.

Es relevante para quienes ya trabajan con ACE-Step y necesitan control fino sobre el timbre vocal y la organización de secciones sin reentrenar el modelo base. Está publicado bajo licencia CC0-1.0, lo que facilita su reutilización y redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre ACE-Step v1.5 turbo |
| Parámetros totales | no disponible (adaptador; el repositorio ocupa 0,0 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) empaquetado como repositorio PEFT cuya `library_name` es `peft` y cuya relación con el modelo base es `adapter`. El modelo base declarado es ACE-Step/Ace-Step1.5, y el adaptador se entrenó específicamente contra el layout de pesos de `acestep-v15-turbo`. La model card indica explícitamente que no es compatible con `acestep-v15-xl-turbo`, ya que precede a la publicación de esa variante y no ha sido portado a ella. El repositorio es de solo inferencia: no incluye dataset, tensores preprocesados ni script de entrenamiento, por lo que no se trata de una publicación de post-entrenamiento.

La información sobre los datos de entrenamiento es muy limitada: la model card del autor se corta en la frase "Trained on a limi...", por lo que no se especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO. El adaptador incorpora un token disparador, `guy_singing_runs`, integrado en los pesos, cuya función es amplificar los comportamientos de voz masculina y estructura lírica cuando se incluye en el caption; su presencia no es necesaria para que el LoRA se cargue ni para que ejerza su efecto de sesgo de base.

## Capacidades

- Sesgo hacia voz masculina: desplaza aproximadamente un 10% la lectura vocal hacia un registro masculino.
- Supresión de fuga de voz femenina: reduce la presencia de voz femenina subyacente cuando el prompt no la solicita.
- Mejora de estructura lírica: incrementa en torno a un 20% la legibilidad de la estructura, con fronteras de sección más limpias y fraseo más predecible entre verso y estribillo.
- Expresividad emocional: empuja la interpretación vocal masculina hacia un registro más humano y respirado, alejado de la lectura sintética plana.
- Amplificación mediante token disparador: el token `guy_singing_runs` refuerza los comportamientos anteriores cuando se incluye en el caption.
- No genera audio por sí mismo: requiere el modelo base ACE-Step v1.5 turbo para funcionar.

## Casos de uso

- Generación de maquetas con voz masculina: aplicar el adaptador a escala 1.0 sobre ACE-Step v1.5 turbo con un prompt que especifique "male singer" y un género para obtener demos vocales masculinas sin reentrenar el modelo base.
- Prototipado de estructura de canciones: usar etiquetas explícitas `[Verse]`, `[Chorus]`, `[Bridge]` e `[Intro]`/`[Outro]` para aprovechar el sesgo de estructura lírica del adaptador y obtener maquetas con secciones mejor delimitadas.
- Corrección de deriva de género vocal: cuando el modelo base genera voz femenina no deseada a partir de un prompt masculino, este adaptador reduce la fuga y estabiliza la lectura vocal.
- Preproducción musical independiente: productores que necesitan demos vocales masculinas coherentes antes de grabar voces reales pueden usarlo como aproximación de bajo coste.
- Refuerzo de expresividad emocional en voces sintéticas: útil para pistas que requieren entrega emocional matizada en lugar de una lectura plana.
- Amplificación selectiva bajo demanda: incluir `guy_singing_runs` cuando se quiere el efecto fuerte, u omitirlo cuando el adaptador debe actuar como filtro sutil por debajo de un prompt ya detallado.
- Generación por lotes en pipelines: integrarlo como fuente LoRA en la API de ACE-Step para producir conjuntos de pistas con un perfil vocal homogéneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras de "+10%" y "+20%" que aparecen en la model card son caracterizaciones subjetivas del autor basadas en escucha A/B, no medidas objetivas. El propio autor advierte que "no existe un porcentaje objetivo de 'más masculino' que medir".

## Requisitos de hardware

- El adaptador en sí añade una sobrecarga de memoria insignificante (repositorio de 0,0 GB; solo contiene los pesos LoRA y su configuración).
- Los requisitos de VRAM reales dependen del modelo base ACE-Step v1.5 turbo, para el cual no se especifican cifras en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (depende del modelo base).
- Opciones de despliegue: la model card menciona la interfaz/API de ACE-Step como entorno de carga del LoRA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables de la misma categoría en la documentación proporcionada. Como referencia interna del propio autor, existen versiones posteriores de JAY que sí soportan `acestep-v15-xl-turbo`, mientras que esta versión temprana funciona únicamente con `acestep-v15-turbo`. No hay datos de rendimiento publicados que permitan comparar objetivamente con alternativas.

## Limitaciones y advertencias

- El sesgo vocal es una tendencia, no un bloqueo: no convierte de forma fiable un prompt de voz femenina en uno masculino, y no está pensado para ello.
- El empuje de estructura lírica es más fuerte con etiquetado explícito `[Verse]`/`[Chorus]`/`[Bridge]`; las letras sin etiquetar aprovechan menos este sesgo.
- Las pistas puramente instrumentales no obtienen prácticamente ningún efecto del adaptador.
- No es compatible con `acestep-v15-xl-turbo`.
- El rendimiento del adaptador se degrada fuera de la escala recomendada: por debajo de 0.9 apenas se percibe, y a 1.0 o más empieza a aplanar la dinámica y a adelantar demasiado la voz en la mezcla.
- Los archivos deben conservar exactamente los nombres `adapter_model.safetensors` y `adapter_config.json`; si se renombran, la interfaz carga sin el LoRA de forma silenciosa.
- Los datos de entrenamiento son incompletos en la documentación disponible (la model card se corta en la descripción del conjunto de entrenamiento), lo que impide evaluar sesgos de los datos.
- No hay información sobre idiomas soportados ni sobre comportamiento multilingüe.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/str8boredg/JAY_1
- Modelo base ACE-Step/Ace-Step1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
