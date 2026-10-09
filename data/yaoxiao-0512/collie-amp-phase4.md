# yaoxiao-0512/collie-amp-phase4

## Resumen

Collie AMP Phase 4 es un paquete de tres políticas de locomoción para el cuadrúpedo BorderCollieRobot (escala 0,42x, 14 actuadores RS00), entrenadas en MuJoCo con el método AMP (Adversarial Motion Priors) para imitar el estilo de marcha de perros border collie reales. No es un modelo de lenguaje: se trata de controladores de movimiento distribuidos como grafos ONNX que mapean una observación propioceptiva de 61 dimensiones a 22 salidas de control articular. Lo publica el usuario yaoxiao-0512 (Yao Xiao) el 8 de octubre de 2026, como cuarta fase de una línea de trabajo que arranca con el campeón de la fase 2 (`collie-velocity-flat-phase2`).

El problema que resuelve es concreto: conseguir que un robot cuadrúpedo de tamaño reducido camine, trote y galope con un estilo biológicamente plausible sin sacrificar robustez ni eficiencia energética. Frente al baseline de la fase 2, las tres políticas AMP mejoran la tasa de éxito del 91,0% al 98,0-99,0% y reducen el error de seguimiento de velocidad de 0,175 m/s a 0,113-0,123 m/s, además de bajar la demanda de par en el percentil 99 de 8,61 N·m a 6,16-6,58 N·m.

Su relevancia ahora es doble: por un lado, demuestra empíricamente que una recompensa de estilo aprendida de vídeos de animales reales no solo mejora la apariencia del movimiento, sino también métricas duras de robustez y eficiencia; por otro, publica artefactos desplegables (ONNX validados con `validate_deploy`) junto con los checkpoints de entrenamiento en formato rsl_rl, algo poco habitual en este tipo de trabajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control (entrada 61-D propiaceptiva, salida 22-D) exportada a grafo ONNX `[1,61] → [1,22]`; entrenada con PPO + recompensa de estilo AMP. Numero de capas y neuronas no especificado |
| Parametros totales | no disponible (no se publica el recuento de parametros del MLP) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una unica observacion propioceptiva de 61 dimensiones (no hay ventana de contexto en el sentido de los modelos de lenguaje). El modulo RMA usa un historial `φ(history)` cuya longitud no se especifica |
| Tipos de cuantizacion | no disponible; se distribuyen ficheros ONNX (`.onnx` + `.onnx.data`) sin indicar la precision (FP32/FP16) |
| Idiomas soportados | no aplica (politica de control motriz; no procesa lenguaje) |
| Licencia | Ambigua: la model card indica "Apache-2.0 (code refs), model weights as-is for the BorderCollieRobot project". Los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | ONNX (`amp_walk_policy.onnx`, `amp_trot_policy.onnx`, `amp_gallop_policy.onnx`, cada uno con su `.onnx.data`) y checkpoints de entrenamiento PyTorch/rsl_rl (`amp_{walk,trot,gallop}_v1_model_199.pt`) |

Datos adicionales relevantes: ganancias PD unificadas Kp 6,0 / Kd 0,2 (simulacion, firmware y puente ROS2); limite de par de los actuadores RS00 de 14 N·m; tamano del repositorio declarado 0,0 GB; 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 2026-10-08.

## Arquitectura y entrenamiento

La arquitectura es una política de control entrenada con PPO sobre MuJoCo, con una recompensa híbrida que combina el objetivo de seguimiento de velocidad con una recompensa de estilo procedente de discriminadores AMP. La fase 4 emplea tres discriminadores de estilo independientes, uno por marcha (walk, trot, gallop), con precisiones de validación de 0,933, 0,911 y 0,912 respectivamente. El peso de la recompensa de estilo es `amp_weight = 0.3` y el entrenamiento se inicializa desde el campeón de la fase 2, con 200 iteraciones de PPO. Los checkpoints publicados (`*_model_199.pt`) corresponden a esas 200 iteraciones en formato rsl_rl.

La parte diferencial está en los datos de estilo. Se partió de 30 vídeos de perros reales (aproximadamente 500 s de metraje) procesados con RTMPose, dando lugar a 38 clips y 20.165 fotogramas. Sobre ellos se aplicó un pipeline de aumento: espejo sagital, remuestreo temporal a 0,8x y 1,2x, secuencias invertidas con peso 0,25, jitter y costura de fases, generando 107.329 pares de transición de 64 dimensiones. La política resultante se exporta a ONNX y se valida con `validate_deploy`, que comprueba contrato de observación/acción, pares y límites articulares. Para despliegue adaptativo al terreno se menciona la combinación con un módulo RMA de la forma `π(x_t, φ(history))`, cuyos detalles no se publican en la model card.

## Capacidades

- Generación de consignas articulares de locomocion cuadrupeda: mapea 61 valores propioceptivos a 22 salidas (14 objetivos de articulaciones de pata mas extras definidos por el contrato de despliegue).
- Tres marchas diferenciadas y seleccionables: `amp_walk_policy.onnx`, `amp_trot_policy.onnx` y `amp_gallop_policy.onnx`.
- Seguimiento de comandos de velocidad: error medio de 0,113-0,123 m/s en simulacion, con tasas de exito del 98-99% sobre 100 episodios x 8 entornos.
- Imitacion de estilo animal: reproduce patrones de marcha derivados de videos de border collies reales mediante recompensa AMP.
- Control compatible con hardware: picos de par de 11,21-11,41 N·m dentro del limite de 14 N·m de los actuadores RS00, con percentiles 99 de 6,16-6,58 N·m.
- Adaptacion al terreno (condicionada): la model card indica que puede combinarse con el modulo RMA `π(x_t, φ(history))`, pero no se documentan aqui su interfaz ni su rendimiento.
- Integracion con ROS2: los mismos valores de Kp/Kd se aplican en simulacion, firmware y puente ROS2.
- No dispone de tool calling, capacidades de agente, razonamiento multietapa, vision, audio ni procesamiento de lenguaje.

## Casos de uso

- Despliegue de marcha lenta en el BorderCollieRobot: la politica `walk` ofrece un 98,0% de exito con el menor pico de par de las tres (11,23 N·m), adecuada para arranques, maniobras de precision y operacion continua a baja velocidad.
- Desplazamiento estable a velocidad media: `trot` alcanza el 99,0% de exito con 0,121 m/s de error de seguimiento y 6,19 N·m en P99, lo que la convierte en la opcion por defecto para navegacion sostenida.
- Maniobras rapidas o persecucion: `gallop` logra el 99,0% de exito con el menor error de seguimiento (0,113 m/s), apropiada cuando la prioridad es la velocidad punta y no el consumo.
- Validacion en simulacion antes de tocar hardware: cargar los tres ONNX en MuJoCo 3.2.5 permite reproducir la comparativa A/B publicada y verificar el contrato de despliegue con `validate_deploy` sin riesgo fisico.
- Investigacion en aprendizaje por refuerzo: los checkpoints `.pt` de rsl_rl y la receta de datos (RTMPose, aumentos, tres discriminadores) sirven como punto de partida reproducible para variar `amp_weight`, el numero de discriminadores o el dataset de estilo.
- Benchmarking de politicas de locomocion: usar la fase 2 como baseline y medir exito, error de tracking y demanda de par permite cuantificar la aportacion del estilo AMP frente a PPO puro en un entorno controlado.
- Integracion en un stack ROS2 para un cuadrupedo de laboratorio: al compartir Kp 6,0 / Kd 0,2 entre simulacion, firmware y puente ROS2, la politica puede inyectarse como nodo de control sin recalibrar ganancias.
- Locomocion adaptativa con RMA: en escenarios con cambios de friccion o pendiente, combinar la politica con el modulo de adaptacion `π(x_t, φ(history))` es la ruta que indica el autor para despliegue en terreno variable (rendimiento no cuantificado en la informacion disponible).

## Benchmarks y rendimiento

Evaluacion A/B del autor frente a la fase 2, en el mismo entorno (100 episodios x 8 entornos, MuJoCo 3.2.5):

| Modelo | Exito | Tracking \|vx−cmd\| | Pico de par | P99 de par | SIM GATE |
|---|---|---|---|---|---|
| Phase 2 (baseline) | 91,0% | 0,175 m/s | 10,23 N·m | 8,61 N·m | MARGINAL |
| AMP walk | 98,0% | 0,123 m/s | 11,23 N·m | 6,16 N·m | PASS |
| AMP trot | 99,0% | 0,121 m/s | 11,21 N·m | 6,19 N·m | PASS |
| AMP gallop | 99,0% | 0,113 m/s | 11,41 N·m | 6,58 N·m | PASS |

Metricas de los discriminadores de estilo (precision de validacion): walk 0,933; trot 0,911; gallop 0,912.

Notas de interpretacion facilitadas por el autor: el campeon de la fase 2 habia sido validado originalmente en MuJoCo 3.8.1 con un 100% de exito y 7,1 N·m, por lo que la tabla se ha recalculado en 3.2.5 para cancelar el efecto de la version del simulador. Las politicas AMP suben el pico de par respecto al baseline (10,23 → 11,21-11,41 N·m) pero reducen el P99 (8,61 → 6,16-6,58 N·m). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo, ni metricas de transferencia sim-to-real.

## Requisitos de hardware

- VRAM para inferencia: no aplica; los grafos ONNX `[1,61] → [1,22]` estan pensados para ejecutarse en CPU con `onnxruntime`. No se publican requisitos de memoria ni tamano de los ficheros.
- GPU recomendadas para inferencia: no se especifica ninguna; no son necesarias por la naturaleza del modelo.
- Cabe en GPU de consumo: si, cualquier GPU, e incluso en inferencia exclusiva de CPU; el cuello de botella real es el bucle de control del robot, no el acelerador.
- GPU para reentrenamiento: no disponible; el entrenamiento PPO + AMP en MuJoCo (200 iteraciones, 8 entornos paralelos) se ejecutaria en GPU segun la practica habitual de rsl_rl, pero el autor no documenta el hardware empleado.
- Opciones de despliegue: ONNX Runtime en Python (ejemplo oficial con `ort.InferenceSession`), firmware del propio robot y puente ROS2, segun menciona la model card. Integraciones con TensorRT, OpenVINO, ONNX Runtime Web u Ollama no estan confirmadas y no proceden para este tipo de modelo.
- Restriccion de despliegue: cada `.onnx` debe acompanarse de su fichero `.onnx.data` en el mismo directorio o la sesion de inferencia fallara.
- Latencia y throughput: no disponible (no se publican tiempos de inferencia ni frecuencia de control objetivo).
- Presupuesto de par a respetar: limite de 14 N·m por actuador RS00; las politicas entregadas consumen 11,21-11,41 N·m de pico y 6,16-6,58 N·m en P99, lo que deja un margen de alrededor del 18-20% sobre el limite.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| collie-amp-phase4 (este) | Politica de locomocion AMP, ONNX + rsl_rl | no disponible | 61-D obs → 22-D accion | 98-99% exito; 0,113-0,123 m/s de error; P99 6,16-6,58 N·m | Ambigua (weights "as-is") | Publico en HuggingFace, 0 descargas |
| collie-velocity-flat-phase2 | Politica de locomocion PPO, sin estilo AMP | no disponible | no disponible | 91,0% exito; 0,175 m/s; P99 8,61 N·m (en MuJoCo 3.2.5); 100% y 7,1 N·m en 3.8.1 | no disponible | Publico en HuggingFace (`yaoxiao-0512/collie-velocity-flat-phase2`) |
| Otras politicas cuadrupedas publicas (legged_gym, rsl_rl, AMP de terceros) | Politicas de locomocion | no disponible | varian | no disponible en la informacion proporcionada | varian | no disponible |

No se han encontrado en la busqueda web checkpoints directamente comparables con metricas publicadas bajo el mismo protocolo de evaluacion. La unica comparacion con datos verificables es la del propio autor contra su fase 2.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni multimodal: no procesa texto, imagen ni audio, y no admite tool calling, agentes ni razonamiento multietapa. Cualquier expectativa de ese tipo es un error de categoria.
- Sesgo de dominio en el estilo: los datos de referencia son 30 videos (unos 500 s) de perros border collie reales, lo que fija una morfologia, un rango de velocidades y un repertorio de marchas concretos; extrapolar a otras especies, tamanos o configuraciones de patas no esta respaldado por la informacion disponible.
- Transferencia sim-to-real no verificada: todas las cifras publicadas (exito, tracking, pares) provienen de MuJoCo. El propio autor etiqueta el resultado como SIM GATE, no como validacion en hardware.
- Sensibilidad a la version del simulador: el baseline de la fase 2 pasa de 100% de exito y 7,1 N·m en MuJoCo 3.8.1 a 91,0% y 8,61 N·m en 3.2.5. Reproducir las cifras exige fijar MuJoCo 3.2.5.
- Margen de par limitado: los picos de 11,21-11,41 N·m frente al limite de 14 N·m dejan un margen del 18-20%; perturbaciones externas, carga adicional o terreno irregular podrian agotarlo.
- Contrato de despliegue incompletamente documentado: las 22 salidas se describen como "14 objetivos de articulaciones de pata mas extras segun contrato de despliegue", sin detallar esos extras ni el orden exacto de las 61 observaciones. Sin los documentos del proyecto no es posible integrarlo a ciegas.
- Discriminadores con precision imperfecta (0,911-0,933): existe confusion residual entre estilos, por lo que las tres politicas pueden solaparse parcialmente en su comportamiento.
- Licencia no resuelta para uso comercial: la model card declara Apache-2.0 para las referencias de codigo y "as-is" para los pesos, mientras que los metadatos de HuggingFace no fijan licencia. Antes de un uso comercial hay que aclararlo con el autor.
- Sin validacion de la comunidad: 0 descargas y 0 likes, y el repositorio declara 0,0 GB de tamano pese a listar seis ficheros de pesos, lo que aconseja verificar la integridad de las descargas.
- Reproducibilidad limitada: no se publican hiperparametros completos, arquitectura exacta de la red, semillas ni configuracion de hardware de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yaoxiao-0512/collie-amp-phase4
- Perfil del autor (Yao Xiao): https://huggingface.co/yaoxiao-0512
- Modelo relacionado, campeon de la fase 2: https://huggingface.co/yaoxiao-0512/collie-velocity-flat-phase2
- HuggingFace (portal general): https://huggingface.co/
- Calendario de lanzamientos de modelos de IA (directorio generico): https://www.scriptbyai.com/ai-model-release-calendar/
- Lista de modelos de IA gratuitos (directorio generico): https://github.com/ClawLabsAI/free-ai-models
- Leaderboard de benchmarks de modelos (directorio generico): https://benchlm.ai/

Nota: los tres ultimos enlaces proceden de la busqueda web pero son directorios generales de modelos de lenguaje y no contienen informacion especifica sobre collie-amp-phase4. No se han encontrado paper, blog tecnico ni repositorio de codigo asociados a este modelo en la informacion disponible.
