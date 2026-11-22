# thu-pacman/Puro-2B-Dolma3-FBT

## Resumen

Puro-2B-Dolma3-FBT es un modelo de lenguaje publicado en Hugging Face por el usuario thu-pacman bajo licencia Apache 2.0. Por el identificador se deduce que se trata de un modelo de aproximadamente 2.000 millones de parametros, construido a partir de la familia Dolma 3 (el corpus de datos de entrenamiento abierto desarrollado por AI2) y con el sufijo FBT, presumiblemente asociado a una variante o tecnica de entrenamiento concreta que el autor no detalla en la model card. La informacion publica disponible es minima: la model card se limita a declarar la licencia, sin descripcion del proceso de entrenamiento, de la arquitectura ni de los datos utilizados.

El modelo se publico el 22 de noviembre de 2026 y, en el momento de redactar esta ficha, registra cero descargas y cero likes, lo que indica que se trata de un lanzamiento reciente sin traccion comunitaria ni validacion externa. No hay pipeline declarado en Hugging Face, por lo que se desconoce la tarea principal para la que fue disenado (text-generation, text2text, etc.).

Su relevancia actual es limitada y fundamentalmente experimental: puede resultar de interes para investigadores que quieran reproducir o auditar variantes de entrenamiento sobre Dolma 3 a escala de 2B de parametros, pero no constituye una opcion recomendable para produccion sin una evaluacion propia previa, dado que no existen benchmarks, documentacion tecnica ni casos de uso verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2B (inferido del identificador del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card. El identificador sugiere un transformer denso de aproximadamente 2.000 millones de parametros, pero no hay confirmacion oficial. El sufijo "Dolma3" apunta a que el entrenamiento pudo emplear el corpus Dolma 3 de AI2, aunque se desconoce la composicion exacta del dataset, el numero de tokens de entrenamiento, si hubo fases de instruccion (SFT), alineamiento por preferencias (RLHF/DPO) o tecnicas de razonamiento extendido. El sufijo "FBT" no se explica en la documentacion disponible.

Tampoco hay informacion sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa, mezcla de expertos o estrategias de tokenizacion. Cualquier afirmacion al respecto seria especulativa y, por tanto, se omite.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de lenguaje de 2B, pero no documentada ni verificada por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Dado que no existe documentacion tecnica ni evaluacion publicada, los siguientes casos son hipoteticos y requeririan validacion previa por parte del equipo que los adopte:

- Experimentacion academica sobre recetas de entrenamiento: util para investigadores que quieran comparar variantes derivadas del corpus Dolma 3 a escala 2B, siempre que el autor publique en el futuro los detalles de la receta.
- Fine-tuning especifico de dominio: un modelo de 2B es manejable en una sola GPU consumer para ajuste con LoRA, lo que permitiria adaptarlo a tareas concretas (clasificacion, extraccion de entidades) partiendo de una base abierta.
- Prototipado rapido en local: por su tamano, puede desplegarse en entornos sin GPU dedicada mediante cuantizacion, aunque se desconoce si existen pesos GGUF publicados.
- Generacion de texto auxiliar de bajo coste: tareas de resumen, reescritura o completado en las que el coste por token sea prioritario frente a la calidad maxima.
- Evaluacion comparativa de modelos pequenos: como referencia adicional en estudios de escalado o de alineamiento.
- Base para distillation: podria servir como alumno en un pipeline de destilacion desde un modelo mayor, si se confirma su calidad base.

En ningun caso se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni aplicaciones criticas sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo denso de 2B, en FP16 se requieren aproximadamente 4-5 GB de VRAM; en cuantizacion de 8 bits, unos 2-3 GB; en 4 bits, en torno a 1,5-2 GB. Estas cifras son estimaciones genericas para modelos de ese tamano y no estan confirmadas para este modelo concreto.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) deberia poder ejecutarlo en FP16; para cuantizaciones de 4 bits bastaria con 4 GB.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU modernas de gama media, aunque no hay confirmacion oficial.
- Opciones de despliegue: no se han publicado pesos en formatos GGUF ni se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Habria que verificar el formato de pesos en el repositorio antes de asumir compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Puro-2B-Dolma3-FBT | ~2B (inferido) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Sin documentacion tecnica |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms | Ampliamente disponible | Con benchmarks publicados |
| Qwen2.5 1.5B | 1,5B | 32K | Apache 2.0 | Ampliamente disponible | Con benchmarks publicados |
| SmolLM2 1.7B | 1,7B | 8K | Apache 2.0 | Ampliamente disponible | Entrenado sobre corpus abierto |

La comparativa se ofrece a titulo orientativo: los tres modelos alternativos cuentan con documentacion tecnica, benchmarks publicados y comunidad activa, mientras que Puro-2B-Dolma3-FBT carece de todo ello en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se describen arquitectura, datos de entrenamiento, tokenizador ni proceso de alineamiento, lo que impide evaluar su calidad de forma informada.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K u otras).
- Riesgo elevado de alucinacion: sin datos sobre alineamiento, no puede descartarse un comportamiento propenso a inventar informacion.
- Idiomas no declarados: se desconoce si el modelo esta entrenado predominantemente en ingles, en multilingue o en otro idioma.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible anticipar sesgos de genero, raza, idioma o dominio.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo en produccion.
- Sin traccion comunitaria: cero descargas y cero likes implican ausencia de validacion externa; cualquier adopcion deberia ir precedida de una evaluacion propia.
- Formato de pesos no confirmado: podria no ser directamente compatible con herramientas estandar de inferencia sin conversion previa.

## Enlaces

- Hugging Face: https://huggingface.co/thu-pacman/Puro-2B-Dolma3-FBT
- Corpus Dolma 3 (AI2): no se ha proporcionado enlace directo en la informacion disponible; referencia general en https://allenai.org/dolma
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
