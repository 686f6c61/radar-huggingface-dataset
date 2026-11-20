# suraj-phanindra/microduck-tug-hc8-aifund

## Resumen

microduck-tug-hc8-aifund es una política de control por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario suraj-phanindra en Hugging Face. No es un modelo de lenguaje: se trata de un artefacto de robótica que genera comandos de locomoción a partir de observaciones proprioceptivas del robot, empaquetado en formato ONNX y cargable directamente en el daemon del robot mediante `robotctl policy load`.

El modelo es un fine-tune de rumezhak/microduck-tug-cup3-tuned-v1, que a su vez deriva de los pesos de auto-juego de liga de lphatnguyen/microduck-tug-of-war-v2 con un normalizador de observaciones re-estimado. Sobre esa base, el autor aplica una liga de estrategias de evolución (evolution strategies) en el simulador Arena, con perturbaciones antitéticas de cada capa y de la media del normalizador, evaluadas contra un conjunto amplio de políticas rivales (v2, rumezhak, juicenv, DenRakEiw, HlibPlakhtii, azukiq, GinDuck, greecree y snapshots de auto-juego). La selección final se realiza por probabilidad simulada de victoria en combates nuevos contra todo el campo de la copa número 3.

La política es perpetua: ejecuta una marcha continua a 50 Hz hasta que se le indique lo contrario, con un espacio de observación de 61 dimensiones y 14 acciones. Su relevancia es acotada pero específica: sirve como competidor dentro de la liga de tug-of-war de microduck y como ejemplo de pipeline de evolución de políticas de locomoción en simulación transferibles a un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (reinforcement learning); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con schema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Espacio de observación | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Normalizador | Integrado en `policy.onnx`; se alimenta con observaciones en bruto |
| Modelo base | rumezhak/microduck-tug-cup3-tuned-v1 (finetune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8` |
| Tamaño del repo | 0.0 GB (artefacto de pequeño tamaño) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, activaciones). Lo que sí se documenta es el proceso de entrenamiento: se parte de los pesos de la red de copa de rumezhak/microduck-tug-cup3-tuned-v1, que combina los pesos de auto-juego de liga de lphatnguyen/microduck-tug-of-war-v2 con el normalizador de observaciones re-estimado por rumezhak. Sobre esa base se aplica una liga de estrategias de evolución en el simulador Arena, con perturbaciones antitéticas de cada capa y de la media del normalizador, puntuadas contra un elenco fijo de políticas rivales más snapshots de auto-juego.

La selección de la política final no se hace por recompensa media sino por probabilidad simulada de victoria (cup odds) en combates nuevos contra todo el campo de la copa número 3. La tabla de tablero (board table) se construye por semilla tomando la mejor de las escaladas continuadas de la tabla de suraj-phanindra/microduck-tug-hc7-aifund —construida sobre las tablas h7p1b, cup2l1, cup2p1 y cup2p2 de jrubiosainz, con semillas de nootxlm/microduck-tug-entry-1— y de la escalada de la tabla de nootxlm/microduck-tug-entry-3, continuando después la escalada. El normalizador de observaciones queda horneado dentro de `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo.

## Capacidades

- Locomoción perpetua del microduck: ejecuta una marcha continua a 50 Hz hasta recibir una orden de parada o sustitución de política.
- Control reactivo a partir de 61 dimensiones de observación proprioceptiva, con 14 acciones de salida.
- Integración directa en el daemon del robot mediante `robotctl policy load <slot> suraj-phanindra/microduck-tug-hc8-aifund`.
- Autocontenida en un único `policy.onnx` con el normalizador incorporado, más un `manifest.json` conforme al schema 2.
- Especializada en el escenario de tug-of-war (competición de tracción) del ecosistema microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Competición en la liga de tug-of-war de microduck: la política se carga en un slot del robot y compite contra otras políticas del campo de la copa número 3, aprovechando que fue seleccionada precisamente por su probabilidad de victoria simulada en ese escenario.
- Referencia de línea base para evolución de políticas: sirve como punto de partida para nuevas rondas de estrategias de evolución en el simulador Arena, dado que su tabla de entrenamiento y sus rivales están documentados.
- Demostración de locomoción continua en robot real: al ser una política perpetua a 50 Hz, permite exhibir una marcha estable en el microduck físico sin lógica de episodios.
- Prueba de pipelines de despliegue `robotctl`: útil para validar la carga de políticas en slots, el cumplimiento del manifiesto schema 2 y la alimentación de observaciones en bruto con normalizador embebido.
- Evaluación comparativa de políticas en simulación: puede enfrentarse contra v2, rumezhak, juicenv, DenRakEiw, HlibPlakhtii, azukiq, GinDuck y greecree para medir mejoras relativas de cada iteración de la liga.
- Estudio de transferencia sim-a-real en robótica de bajo coste: el artefacto permite analizar cómo una política evolucionada en Arena se comporta en el microduck físico con observaciones proprioceptivas reales.
- Material didáctico sobre RL y evolution strategies aplicadas a robótica: el linaje de modelos base, tablas y semillas documentado facilita explicar un pipeline completo de entrenamiento por competición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la política fue elegida por probabilidad simulada de victoria en combates nuevos contra el campo de la copa número 3, sin cifras concretas de win rate, recompensa ni métricas de locomoción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política es un artefacto ONNX de pequeño tamaño, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponibles; para un modelo de este tamaño no se requiere A100, H100 ni RTX 4090. Cualquier GPU modesta o la propia CPU del robot es suficiente.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load <slot> suraj-phanindra/microduck-tug-hc8-aifund`, con runtime ONNX. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el contrato de control es de 50 Hz (20 ms por paso), pero no se publican mediciones de latencia del runtime ONNX en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-tug-hc8-aifund | Política RL para microduck (ONNX) | rumezhak/microduck-tug-cup3-tuned-v1 | 61-D observación, 14 acciones, 50 Hz | no disponible | Hugging Face |
| rumezhak/microduck-tug-cup3-tuned-v1 | Política RL para microduck | lphatnguyen/microduck-tug-of-war-v2 | no disponible | no disponible | Hugging Face |
| lphatnguyen/microduck-tug-of-war-v2 | Política RL para microduck (auto-juego de liga) | no disponible | no disponible | no disponible | Hugging Face |
| suraj-phanindra/microduck-tug-hc7-aifund | Política RL para microduck | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (win rate, recompensa) entre estas políticas en la información proporcionada; la comparación se limita a linaje y formato.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento, código o matemáticas.
- Licencia no disponible: no puede asumirse permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de benchmarks publicados: la selección por probabilidad simulada de victoria no equivale a una validación exhaustiva en robot real.
- Riesgo de sobreajuste al campo de la copa número 3: la política fue elegida por su rendimiento contra un elenco concreto de rivales, lo que puede no generalizar a oponentes o condiciones no vistas.
- Dependencia del simulador Arena: el comportamiento observado en simulación puede degradarse por diferencias de dinámica, fricción o latencia en el microduck físico.
- Normalizador embebido: alimentar la política con observaciones ya normalizadas externamente produciría un doble normalizado y un comportamiento incorrecto.
- Sin información sobre sesgos: al no tratar datos humanos ni lenguaje, los sesgos sociales habituales no aplican, pero no se documentan sesgos de comportamiento (por ejemplo, preferencia por estrategias agresivas de tracción).
- Artefacto de nicho y con tracción comunitaria nula (0 descargas, 0 likes en el momento de la consulta): soporte y mantenimiento no garantizados.
- Compatibilidad sujeta al schema 2 del manifiesto de políticas y al commit `5cee942d8` del repositorio de entrenamiento; cambios futuros en el daemon podrían romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-tug-hc8-aifund
- Modelo base: https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v1
- Modelo antecesor del autor: https://huggingface.co/suraj-phanindra/microduck-tug-hc7-aifund
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`); no se proporciona URL directa en la información disponible
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa en la información disponible
