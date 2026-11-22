# zk0bot/study001-specialist-eye-drops

## Resumen

`zk0bot/study001-specialist-eye-drops` es un checkpoint de investigacion publicado en Hugging Face por el usuario zk0bot, derivado del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje: se trata de una politica visomotora (vision-language-action, VLA) para control robotico, afinada sobre una unica tarea de manipulacion denominada `eye_drops_to_basket` dentro del banco de pruebas ArmnetBench. El autor lo etiqueta explicitamente como artefacto de estudio y copia de seguridad de checkpoint, no como el modelo final del proyecto zk0, que reside en el repositorio `ivelin/zk0-smolvla-fl`.

El modelo parte de SmolVLA, una arquitectura compacta de tipo VLA pensada para ejecutar politicas de robotica en hardware modesto, y se ha sometido a un ajuste fino completo (full fine-tune) de 3.000 pasos sobre 50 demostraciones de una sola tarea. El resultado es un especialista de referencia ("ceiling") que sirve como cota superior de rendimiento para comparar con variantes mas generales o con tecnicas de adaptacion mas eficientes.

Su relevancia es acotada y experimental: no esta pensado para uso general, no documenta idiomas, benchmarks ni pipeline, y su interes se limita a quien investigue el ecosistema LeRobot, SmolVLA o la evaluacion de politicas roboticas de tarea unica. El checkpoint pesa aproximadamente 0,9 GB y contiene 450.046.176 parametros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre base `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 906.712.552 bytes) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `lerobot/smolvla_base`, la implementacion de SmolVLA dentro del ecosistema LeRobot. SmolVLA es una politica visomotora que combina un codificador visual y un componente de lenguaje para producir acciones de robot a partir de observaciones e instrucciones. El checkpoint resultante conserva la arquitectura del modelo base; la informacion disponible no detalla la composicion interna (capas, dimensiones, atencion) ni el numero de tokens de entrenamiento.

El entrenamiento consistio en 3.000 pasos de ajuste fino supervisado sobre 50 demostraciones de la tarea `eye_drops_to_basket` de ArmnetBench, ejecutado en una DGX Spark. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El autor identifica este checkpoint como especialista de referencia de tarea unica y lo respalda en remoto bajo una politica de redundancia de checkpoints significativos. El hash sha256 del archivo de pesos (pre-subida) es `9bce0d3f55bc54747c9ce9992b27c418ccdbccc02bee3cca31600cd0622cbfff`.

## Capacidades

- Ejecucion de una unica tarea de manipulacion robotica: `eye_drops_to_basket` (trasladar un objeto de gotas oftalmicas a una cesta), segun la definicion de ArmnetBench.
- Generacion de acciones motrices a partir de observaciones visuales e instrucciones, propia de una politica VLA.
- Ajuste fino completo sobre el modelo base, sin tecnicas de bajo rango documentadas.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision general ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Referencia de techo de rendimiento: sirve para establecer la cota superior de exito en la tarea `eye_drops_to_basket` frente a la que medir variantes mas generales o adaptaciones eficientes.
- Investigacion en politicas de tarea unica: permite estudiar el comportamiento de un SmolVLA totalmente ajustado sobre 50 demostraciones y comparar con tecnicas de adaptacion con menos datos.
- Reproduccion de experimentos LeRobot: al estar en formato safetensors y libreria `lerobot`, puede cargarse en el pipeline de entrenamiento y evaluacion de LeRobot para replicar el estudio 001.
- Evaluacion de robustez en manipulacion: util como punto de partida para analizar sensibilidad a variaciones de iluminacion, posicion de camara o colocacion del objeto en un entorno controlado.
- Baseline en comparativas de eficiencia de ajuste fino: contrasta el coste y resultado de un full fine-tune de 3.000 pasos frente a alternativas de bajo rango o congelacion parcial.
- Docencia y divulgacion tecnica: ejemplo concreto y ligero (0,9 GB) de como se estructura un checkpoint de politica VLA en el ecosistema LeRobot para demostraciones practicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el peso del checkpoint (0,9 GB en safetensors) sugiere que el modelo completo en precision de entrenamiento puede residir en GPUs de gama consumer, pero no se confirma.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una DGX Spark segun la model card.
- Compatibilidad con GPU consumer: no confirmada; por tamano de parametros (450 M) es plausible que quepa en GPUs consumer, pero no se documenta.
- Opciones de despliegue: la libreria declarada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zk0bot/study001-specialist-eye-drops` | 450.046.176 | SmolVLA (VLA) | `eye_drops_to_basket` (ArmnetBench) | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | SmolVLA (VLA) | Politica general base | no disponible | Hugging Face |
| `ivelin/zk0-smolvla-fl` | no disponible | SmolVLA (VLA) | Modelo final del proyecto zk0 | no disponible | Hugging Face |

La comparacion con alternativas de la misma categoria (otras politicas VLA) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es el modelo final del proyecto: el autor indica explicitamente que es un artefacto de estudio y copia de seguridad de checkpoint; el modelo publicado es `ivelin/zk0-smolvla-fl`.
- Especialista de tarea unica: no generaliza a otras tareas de manipulacion fuera de `eye_drops_to_basket`.
- Entrenado con solo 50 demostraciones y 3.000 pasos: riesgo de sobreajuste al entorno y condiciones de recogida de datos.
- No se documentan sesgos, evaluaciones de robustez ni metricas de rendimiento.
- No hay informacion sobre idiomas, contexto ni cuantizaciones soportadas.
- Licencia apache-2.0: permite uso comercial, pero el modelo no esta pensado para produccion y carece de garantias de rendimiento.
- Sin pipeline declarado ni datos de evaluacion: no recomendable como dependencia en sistemas reales sin validacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zk0bot/study001-specialist-eye-drops
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo final del proyecto: https://huggingface.co/ivelin/zk0-smolvla-fl
- LeRobot (libreria): https://github.com/huggingface/lerobot
