# yorklyb/nwing

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, cuya implementacion en LeRobot ha sido adaptada por el autor yorklyb a partir del repositorio open source OpenPI. El modelo aborda el reto de la generalizacion en mundo abierto en robotica: mientras que los robots tradicionales funcionan bien en entornos controlados, π₀.₅ esta disenado para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento.

Este repositorio contiene un checkpoint de la politica π₀.₅ entrenado sobre el dataset nwing, con aproximadamente 4.140 millones de parametros y un tamano de 9,4 GB en formato safetensors. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones significativas. El modelo se integra con el ecosistema LeRobot, facilitando el entrenamiento, la evaluacion y el despliegue en robots compatibles.

La relevancia de este modelo radica en que representa una evolucion significativa respecto a su predecesor π₀, incorporando capacidades de generalizacion en mundo abierto que son criticas para la adopcion de la robotica en entornos no estructurados, como hogares, hospitales o fabricas con configuraciones cambiantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo Vision-Language-Action (VLA) que combina procesamiento de vision, lenguaje natural y generacion de acciones motoras. La implementacion en LeRobot se adapta del repositorio OpenPI de Physical Intelligence, que publica el codigo abierto de la politica. La arquitectura integra un codificador visual, un modulo de lenguaje y una cabeza de accion que produce comandos motores directamente a partir de observaciones e instrucciones.

El modelo ha sido entrenado sobre el dataset nwing, aunque no se dispone de detalles especificos sobre el numero de tokens, la composicion del dataset o el uso de tecnicas como RLHF o DPO. La innovacion principal de π₀.₅ frente a π₀ es su capacidad de generalizacion en mundo abierto, es decir, la habilidad de producir acciones correctas en entornos y situaciones que no formaban parte del conjunto de entrenamiento. El checkpoint se ha entrenado y publicado mediante LeRobot, que gestiona el ciclo completo de entrenamiento, evaluacion e inferencia.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales y lenguaje natural (arquitectura VLA).
- Generalizacion en mundo abierto: capacidad de operar en entornos y situaciones no vistos durante el entrenamiento.
- Aprendizaje por imitacion a partir de datasets de demostraciones mediante el ecosistema LeRobot.
- Entrenamiento desde cero con el comando `lerobot-train`, que permite configurar el dataset, la politica y el dispositivo de computo.
- Evaluacion e inferencia con `lerobot-record`, compatible con robots como el SO-100 follower.
- Publicacion y carga de checkpoints directamente desde y hacia Hugging Face Hub.

## Casos de uso

- Manipulacion robotica en entornos domesticos: el modelo puede controlar brazos roboticos para tareas como recoger objetos, abrir puertas o interactuar con electrodomesticos en hogares no estructurados, gracias a su capacidad de generalizacion en mundo abierto.
- Automatizacion industrial flexible: en fabricas donde los procesos cambian con frecuencia, π₀.₅ puede adaptarse a nuevas configuraciones de linea sin necesidad de reentrenamiento especifico por cada variante.
- Robotica educativa y de investigacion: los investigadores pueden utilizar este checkpoint como punto de partida para fine-tuning en tareas especificas mediante LeRobot, reduciendo el tiempo de entrenamiento desde cero.
- Prototipado rapido en laboratorios de robotica: al ser un modelo de ~4,14 B de parametros con licencia Apache 2.0, puede ejecutarse en hardware asequible para validar algoritmos de aprendizaje por imitacion antes de escalar a sistemas mayores.
- Teleoperacion asistida: el modelo puede complementar sistemas de teleoperacion generando acciones sugeridas basadas en la observacion actual, reduciendo la carga cognitiva del operador.
- Desarrollo de sistemas de robotica de bajo coste: su tamano moderado y licencia permisiva permiten desplegarlo en robots de investigacion economicos, como los basados en SO-100, para experimentos de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware en la informacion proporcionada. Como referencia estimada para un modelo de ~4,14 B de parametros en formato safetensors:

- VRAM estimada para inferencia en FP32: aproximadamente 16,6 GB (4,14 B × 4 bytes por parametro).
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 4,1 GB.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 2,1 GB.
- GPUs recomendadas para entrenamiento: RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- GPUs compatibles para inferencia: cualquier GPU con al menos 8 GB de VRAM, dependiendo de la cuantizacion.
- El despliegue se realiza mediante el ecosistema LeRobot, que utiliza PyTorch y soporta aceleracion CUDA.
- Para entrenamiento desde cero, se recomienda al menos 24 GB de VRAM.

Nota: estas cifras son estimaciones teoricas basadas en el numero de parametros y no en datos oficiales del autor.

## Comparativa con modelos similares

No se dispone de informacion suficiente en los datos proporcionados para establecer una comparativa fiable con otros modelos. El modelo π₀.₅ de Physical Intelligence es la referencia principal, pero no se dispone de datos de rendimiento comparativos en la informacion disponible.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo.
- No se dispone de datos sobre riesgo de alucinacion o fallos en la generacion de acciones.
- No se dispone de informacion sobre limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos completos de la licencia y las condiciones del dataset nwing.
- El modelo requiere un robot compatible y el ecosistema LeRobot para funcionar; no es un modelo autonomo.
- El checkpoint esta entrenado especificamente sobre el dataset nwing, por lo que su rendimiento en otras tareas puede verse limitado sin fine-tuning adicional.
- No se dispone de informacion sobre la calidad, cobertura o posibles sesgos del dataset nwing.
- El repositorio presenta 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o de nicho sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yorklyb/nwing
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor en Hugging Face: https://huggingface.co/yorklyb
- Perfil del autor en GitHub: https://github.com/yorklyb
