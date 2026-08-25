# XuPeng23/AeroDPO

## Resumen

AeroDPO es un modelo de vision-lenguaje para navegacion de vehiculos aereos no tripulados (UAV-VLN), desarrollado por Xu Peng. El modelo aborda el problema de la navegacion reactiva en entornos 3D complejos mediante un enfoque minimalista de extremo a extremo, pero empleando un modelo de lenguaje de solo 2.000 millones de parametros con entradas visuales de alta resolucion, en lugar de los modelos masivos de 7B o mas que se usan habitualmente en este campo.

Su relevancia radica en demostrar que un modelo ultraligero puede igualar la tasa de exito en navegacion de baselines de 7B, lo que reduce significativamente la latencia y los requisitos de hardware para aplicaciones en tiempo real. El nombre "AeroDPO" hace referencia a su metodologia de entrenamiento, que combina percepcion de alta fidelidad con optimizacion automatica de preferencias (Automated Preference Optimization, DPO). El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial e investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje multimodal (vision-lenguaje) para navegacion; arquitectura exacta no disponible |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible, pero el modelo se describe como un sistema de navegacion de UAV de extremo a extremo que integra percepcion visual de alta fidelidad con un modelo de lenguaje de 2B parametros. A diferencia de enfoques anteriores que dependen de LLMs de 7B o mas, AeroDPO utiliza un modelo mas pequeno y rapido, lo que permite resolver la latencia en aplicaciones en tiempo real.

El entrenamiento se basa en optimizacion de preferencias (DPO), un metodo que ajusta el modelo a partir de preferencias humanas o automaticas sobre trayectorias de navegacion, en lugar de depender exclusivamente de supervision directa. El termino "Automated Preference Optimization" sugiere que el proceso de generacion de preferencias esta automatizado, aunque no se especifican los datos de entrenamiento (numero de tokens, composicion del dataset ni si hubo etapas previas de RLHF).

## Capacidades

- Navegacion de UAV en entornos 3D complejos mediante instrucciones en lenguaje natural y entradas visuales de alta resolucion.
- Razonamiento multimodal: integra informacion visual (imagenes de camara del dron) con comandos textuales para generar acciones de control.
- Inferencia de baja latencia: gracias a su tamano de 2B, es adecuado para sistemas embebidos o con restricciones de tiempo real.
- Igualacion de rendimiento con baselines de 7B en tasa de exito de navegacion, segun los autores.
- Soporte de tool calling y agentes: no disponible (no se menciona en la informacion).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible; el modelo se centra en navegacion visual, no en generacion de texto general.

## Casos de uso

- Navegacion autonoma de drones en entornos interiores o urbanos: el modelo procesa la imagen de la camara del UAV y la instruccion de navegacion ("ve al tercer piso, gira a la izquierda") para generar comandos de control en tiempo real, gracias a su tamano reducido que permite ejecucion en hardware de bajo consumo.
- Misiones de busqueda y rescate: un operador proporciona descripciones de objetivos ("encuentra a la persona con chaqueta roja") y el modelo guia el dron autonomamente, con una latencia lo bastante baja para responder a cambios en el entorno.
- Inspeccion de infraestructuras: el modelo puede navegar alrededor de puentes, torres o plantas industriales siguiendo rutas descritas textualmente, reduciendo la necesidad de teleoperacion manual.
- Logistica y entrega en interiores: en almacenes, el dron interpreta ordenes como "lleva el paquete a la zona de carga 3" y ejecuta la navegacion visualmente, optimizando el flujo de trabajo.
- Vigilancia y seguridad: el sistema permite a un operador describir una ruta de patrulla y el dron la ejecuta de forma autonoma, con la capacidad de adaptarse a obstaculos no previstos gracias a la percepcion visual de alta fidelidad.
- Investigacion en robotica: sirve como base para experimentos de navegacion de agentes en entornos simulados o reales, gracias a su licencia abierta y su tamano manejable para entrenar o adaptar a nuevos dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper indica que el modelo de 2B iguala la tasa de exito de navegacion de baselines de 7B, pero no se proporcionan cifras concretas (como Success Rate, SR, o Success weighted by Path Length, SPL) en los resultados de la busqueda web. No se incluyen comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de 2B, en precision FP16 se estima que ocuparia aproximadamente 4-5 GB de VRAM, pero sin confirmar.
- GPU recomendadas: no disponible. Por su tamano, cabria en GPUs consumer como RTX 3060 (12 GB) o RTX 4090, pero no se especifica.
- Si cabe en consumer GPU: probablemente si, dado su tamano de 2B, aunque no hay confirmacion oficial.
- Opciones de despliegue: no disponible. No se mencionan frameworks de despliegue, pero por ser un modelo multimodal podria usar vLLM, TGI o transformers, sin confirmar.
- Latencia y throughput: no disponible, aunque el objetivo del modelo es precisamente reducir la latencia frente a modelos de 7B.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de navegacion UAV-VLN en la informacion proporcionada. Se menciona que supera a baselines de 7B en tasa de exito, pero no se identifican modelos concretos ni se ofrecen metricas comparativas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo entrenado para navegacion, puede heredar sesgos de los datos de entrenamiento (entornos tipicos, distribucion de escenas), lo que podria afectar a la generalizacion en entornos no representados.
- Riesgo de alucinacion: en el contexto de navegacion, el modelo podria generar trayectorias erroneas o interpretar instrucciones de forma incorrecta, especialmente en situaciones con baja visibilidad o obstaculos no vistos en el entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; si es corta, podria limitar instrucciones largas o historicos de navegacion.
- Limitaciones de idioma: no se indican idiomas soportados; probablemente este optimizado para ingles, lo que limita su uso en otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificacion, pero se debe incluir el aviso de copyright y mantener la licencia en distribuciones.
- Caveat de produccion: el modelo esta disenado para navegacion de UAV, no para generacion de texto general. Su uso fuera de este dominio podria producir resultados inesperados. Ademas, no hay informacion sobre la robustez ante condiciones adversas (viento, iluminacion, etc.) en el paper disponible.

## Enlaces

- HuggingFace: https://huggingface.co/XuPeng23/AeroDPO
- GitHub (repositorio oficial): https://github.com/XuPeng23/AeroDPO
- Paper en ArXiv: https://arxiv.org/pdf/2608.07557
- CatalyzEX (pagina del paper con codigo): https://www.catalyzex.com/paper/aerodpo-unleashing-lightweight-uav-navigation
