# yanguanyue/DFTA-baselines

## Resumen

`yanguanyue/DFTA-baselines` no es un modelo único, sino un repositorio de artefactos de investigación publicado por el autor del proyecto DFTA (Dual Flow Transformation Architecture). Contiene los checkpoints completos y las copias de configuración de los métodos de comparación (baselines) empleados en los experimentos de DFTA, un trabajo sobre generación de imágenes de lesiones cutáneas en dermatoscopia. El repositorio pesa 12,7 GB y se organiza por corpus y por método: `ham10000/<metodo>/` para las ejecuciones originales sobre HAM10000 y `cross-dataset/<dataset>/<experimento>/<metodo>/` para los experimentos cruzados con ISIC2017 y Dermofit.

Los métodos incluidos son ArSDM, ControlNet, Derm-T2IM, DFMGAN, DreamBooth, LesionGen, LF-VAR, Siamese, skin-disease-diffusion y T2I-Adapter. Buena parte de ellos pertenece a la familia de modelos de difusión texto-a-imagen (ControlNet, DreamBooth y T2I-Adapter son adaptadores o variantes de Stable Diffusion), aunque el repositorio no documenta la arquitectura concreta de cada checkpoint. El propósito declarado es la preservación de artefactos experimentales para permitir la reproducibilidad de las comparaciones, no la distribución de un sistema listo para producción.

Su relevancia es, por tanto, metodológica: sirve para replicar resultados, auditar configuraciones y reutilizar pesos base en nuevos estudios de generación de imágenes médicas. El propio autor advierte que son artefactos de investigación y no sistemas clínicamente validados. No hay pipeline declarado, no hay métricas de evaluación publicadas en este repositorio (se excluyen explícitamente tablas de métricas, logs y datasets crudos) y la licencia no está definida de forma global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una arquitectura unica: coleccion de checkpoints de 10 metodos generativos distintos (ArSDM, ControlNet, Derm-T2IM, DFMGAN, DreamBooth, LesionGen, LF-VAR, Siamese, skin-disease-diffusion, T2I-Adapter) |
| Parametros totales | No disponible (varia por metodo y por checkpoint; no se documenta el conteo) |
| Parametros activos | No aplica (no se declara ningun modelo MoE en la informacion disponible) |
| Longitud de contexto | No aplica / no disponible (modelos de generacion de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (no se documentan variantes fp16, fp32, int8 ni GGUF) |
| Idiomas soportados | Ingles (`en` como etiqueta del repositorio; los prompts de los metodos texto-a-imagen se asumen en ingles) |
| Licencia | No disponible como licencia unica. El autor indica que no existe una licencia CC global para pesos de terceros: cada metodo, modelo base y dependencia conserva su licencia original. La declaracion CC BY-NC 4.0 de DFTA se aplica solo al contenido propio del autor |
| Formato de pesos | No disponible. El repositorio contiene checkpoints completos, ficheros de estado de entrenamiento y copias de configuracion, con un manifiesto SHA-256 (`backup_manifest.json`) para restauracion |
| Tamano del repositorio | 12,7 GB |
| Datasets de referencia | HAM10000 (principal), ISIC2017 y Dermofit (experimentos cross-dataset) |
| Pipeline de HuggingFace | No declarado |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-22 |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura propia, sino que agrupa los checkpoints de los metodos de comparacion usados en los experimentos de DFTA. Por los nombres recogidos, la coleccion mezcla al menos tres familias: metodos de difusion texto-a-imagen y sus adaptadores (ControlNet, DreamBooth, T2I-Adapter, Derm-T2IM, skin-disease-diffusion), modelos generativos tipo GAN para dermatoscopia (DFMGAN, ArSDM, presumiblemente LesionGen) y variantes especificas del trabajo (LF-VAR, Siamese). Esta clasificacion se deduce de la nomenclatura de los metodos; el repositorio no incluye fichas tecnicas por checkpoint ni especifica el numero de parametros, la resolucion nativa de entrenamiento ni el schedule de difusion de cada uno.

En cuanto a datos, el autor indica que los datasets crudos, las vistas previas de entrenamiento, los logs y las tablas de metricas se han excluido deliberadamente de este repositorio. Solo se conservan los pesos, las configuraciones asociadas y los avisos de licencia encontrados en el checkout local (`licenses/`), que el propio autor califica de inventario no exhaustivo. No se documentan el numero de tokens o imagenes de entrenamiento, la composicion exacta de los datasets, ni si hubo etapas de ajuste fino con preferencias humanas (no aplicable en generacion de imagen en la mayoria de los casos). Los experimentos se organizan en dos bloques: entrenamiento y evaluacion sobre HAM10000, y transferencia cruzada a ISIC2017 y Dermofit.

## Capacidades

- Generacion de imagenes dermatoscopicas de lesiones cutaneas, condicionada por el metodo concreto (texto, mascara de lesion o ambas, segun el baseline).
- Generacion condicionada por mascara en los metodos marcados con (M) en la comparativa cualitativa del proyecto DFTA (ControlNet y T2I-Adapter son los candidatos habituales para control espacial).
- Ajuste personalizado sobre un concepto o dominio concreto en el caso de DreamBooth (fine-tuning sobre unas pocas imagenes de referencia).
- Reproduccion de experimentos: los checkpoints permiten regenerar las comparaciones cualitativas y cuantitativas del paper de DFTA.
- Transferencia entre dominios: los experimentos cross-dataset sobre ISIC2017 y Dermofit permiten evaluar la generalizacion de cada metodo.
- Restauracion verificable de artefactos: `backup_manifest.json` y la etiqueta `backup-2026-10-23` permiten comprobar la integridad de cada fichero mediante SHA-256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision multimodal de entrada, audio ni modo "thinking": son modelos de generacion de imagen, no asistentes de lenguaje.

## Casos de uso

- Reproduccion de resultados academicos: descargar los checkpoints de cada baseline y reejecutar la evaluacion sobre HAM10000 para verificar las cifras del paper de DFTA, usando las configuraciones incluidas en el repositorio.
- Estudios de ablation comparativa: enfrentar DFTA contra ArSDM, DFMGAN, Derm-T2IM o LesionGen manteniendo el mismo pipeline de evaluacion, lo que permite aislar el efecto de la arquitectura sin reentrenar los baselines desde cero.
- Aumento de datos sinteticos para desequilibrio de clases: generar imagenes de clases poco representadas de HAM10000 (por ejemplo, dermatofibroma o queratosis actínica) para equilibrar el entrenamiento de un clasificador aguas abajo, validando siempre con datos reales separados.
- Investigacion en privacidad de datos medicos: emplear las imagenes sinteticas como sustituto de imagenes de pacientes en prototipos y demos internas, reduciendo la exposicion de datos identificables.
- Benchmarking de nuevos metodos generativos: usar esta coleccion como linea base fija contra la que medir un modelo nuevo (FID, IS, LPIPS o metricas de consistencia morfologica), aprovechando que los pesos ya estan entrenados y en un formato reproducible.
- Docencia y formacion tecnica: comparar cualitativamente como distintas familias (GAN frente a difusion, condicionado por texto frente a condicionado por mascara) abordan la misma tarea de sintesis de lesiones, con artefactos reales en lugar de ejemplos de blog.
- Auditoria de licencias de terceros: el directorio `licenses/` y el manifiesto sirven como punto de partida (no exhaustivo) para revisar las obligaciones de cada modelo base antes de reutilizar pesos en un proyecto derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio excluye explicitamente puntuaciones de evaluacion, tablas de metricas y logs; solo se conservan pesos y configuraciones. La model card remite al repositorio de codigo y al paper del proyecto DFTA para los resultados, sin incluirlos aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Depende del metodo concreto; los checkpoints de difusion a resolucion 512x512 en fp16 suelen requerir del orden de 8-12 GB, pero esta cifra es una orientacion general y no esta verificada para estos pesos.
- GPU recomendadas: no documentadas. Para los metodos basados en difusion, una GPU con 16-24 GB (RTX 4090, A5000, A100) cubre la mayoria de escenarios; los metodos GAN suelen ser mas ligeros.
- Ajuste en GPU de consumo: probable en el caso de los metodos GAN y de los adaptadores de difusion en fp16 sobre RTX 3060/4060 Ti (12-16 GB); no confirmado por el autor.
- Opciones de despliegue: no documentadas. Para los metodos derivados de Stable Diffusion (ControlNet, DreamBooth, T2I-Adapter, Derm-T2IM) el camino habitual es `diffusers`; para el resto habria que consultar el repositorio de codigo del proyecto DFTA.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 12,7 GB; conviene descargar solo las carpetas del metodo de interes en lugar del snapshot completo.

## Comparativa con modelos similares

| Modelo / repositorio | Contenido | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yanguanyue/DFTA-baselines` (este repo) | Checkpoints de 10 metodos de comparacion (HAM10000, ISIC2017, Dermofit) | No disponible | No aplica | Mixta por metodo; sin licencia global | Publico en HuggingFace, 12,7 GB |
| `yanguanyue/DFTA-10000-steps` | Checkpoints del modelo DFTA y de sus ablaciones | No disponible | No aplica | CC BY-NC 4.0 para contenido propio del autor | Publico en HuggingFace |
| `yanguanyue/DFTA-generated-results` | Imagenes generadas por los experimentos | No aplica | No aplica | No disponible | Privado, requiere acceso autorizado |
| Repositorio GitHub `yanguanyue/DFTA-` | Codigo del metodo DFTA y comparativas cualitativas | No aplica | No aplica | No disponible | Publico |

No se dispone de comparaciones cuantitativas con modelos externos a la coleccion (por ejemplo, otros generadores de dermatoscopia publicados por terceros) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo único: es un archivo de artefactos de investigacion. No existe una unica API, tokenizer, pipeline ni firma de entrada/salida comun a todos los checkpoints.
- Sin validacion clinica. El autor lo declara explicitamente: son artefactos de investigacion, no sistemas validados para diagnostico ni para uso asistencial.
- Licencia ambigua. No hay licencia global; cada metodo y cada modelo base conserva la suya. La ausencia de un aviso en `licenses/` no implica permiso para relicenciar. Revisar los terminos de cada proyecto antes de cualquier uso comercial o redistribucion.
- Uso comercial restringido en la practica: la declaracion CC BY-NC 4.0 del autor es no comercial y solo cubre su propio contenido; los pesos de terceros pueden tener condiciones adicionales.
- Riesgo de alucinacion visual: los generadores pueden producir texturas patologicas plausibles pero inexistentes, artefactos morfologicos y lesiones sinteticas que no corresponden a ninguna categoria clinica real.
- Sesgo de dominio: los datos derivan de HAM10000, ISIC2017 y Dermofit, con una distribucion demografica y de fototipos de piel limitada; el rendimiento fuera de esa distribucion no esta caracterizado.
- Idiomas: el repositorio se etiqueta solo en ingles; los prompts de los metodos texto-a-imagen estan presumiblemente en ingles y no se documenta soporte multilingue.
- Ausencia de metricas: no se incluyen FID, IS, LPIPS ni tablas comparativas, por lo que no es posible evaluar la calidad de cada checkpoint sin reejecutar la evaluacion.
- Entorno de ejecucion incompleto: el repositorio no incluye el entorno completo, los datasets crudos ni los logs; es necesario combinarlo con el codigo del proyecto en GitHub.
- Trazabilidad: conviene verificar la integridad con `backup_manifest.json` y la etiqueta `backup-2026-10-23`; las subidas parciales anteriores a esa etiqueta estan incompletas por diseno.
- Fechas de metadatos incoherentes (creacion en 2026), lo que sugiere un posible error de sellado temporal; no afecta al contenido pero conviene tenerlo en cuenta al citar el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yanguanyue/DFTA-baselines
- Perfil del autor en HuggingFace: https://huggingface.co/yanguanyue
- Checkpoints de DFTA y ablaciones: https://huggingface.co/yanguanyue/DFTA-10000-steps
- Imagenes generadas (privado, requiere acceso autorizado): https://huggingface.co/datasets/yanguanyue/DFTA-generated-results
- Codigo del proyecto DFTA: https://github.com/yanguanyue/DFTA-
- Rama principal del repositorio de codigo: https://github.com/yanguanyue/DFTA-/tree/main/master
- Documentacion del metodo DFTA (Dual Flow Transformation Architecture): https://github.com/yanguanyue/DFTA/tree/master/main
