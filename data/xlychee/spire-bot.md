# xlychee/spire-bot

## Resumen

Spire Bot es una red neuronal entrenada mediante aprendizaje por refuerzo para jugar a Slay the Spire como el personaje Ironclad en Ascension 20, con el objetivo de derrotar al Corazón. Lo desarrolla el usuario xLychee y se distribuye como un unico fichero ONNX de unos 22 millones de parametros y 92 MB, con la etiqueta de metadatos `format = spire-bot-model-1`. No es un modelo de lenguaje: es una politica de decision que puntua las opciones legales de cada paso de una partida.

El modelo cubre todas las decisiones de una run (cartas a jugar y sus objetivos, pociones, recompensas de carta, reliquias, eventos, tiendas, descansos y ruta en el mapa) y produce, ademas de los logits por opcion, dos estimaciones del resultado de la run (`value` y `bvalue`) que alimentan el panel del bot y la busqueda en combates de elite y jefe. Se integra mediante el puente Spire Bot, que selecciona la opcion con mayor puntuacion y, en ciertos combates, explora las mejores alternativas sobre copias del combate.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de agente de refuerzo aplicado a un juego de cartas complejo, con un resultado medido en partidas reales (29,5 % de victorias sobre 220 semillas fijas sin busqueda) y una licencia permisiva CC BY 4.0. No dispone de informacion sobre idiomas, tokenizador ni capacidades de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal exportada a ONNX; no se detalla la topologia) |
| Parametros totales | aproximadamente 22 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (batch y numero de opciones variables; no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX de 92 MB) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`models/model.onnx`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red: solo indica que es una red neuronal exportada a ONNX con unos 22 millones de parametros y 92 MB, con entradas correspondientes a las caracteristicas que genera el simulador del paquete (`spire_sim`) para cada decision, y salidas `logits` (una puntuacion por opcion legal), `value` y `bvalue` (dos estimaciones del desarrollo de la run). El tamano de lote y el numero de opciones son variables, lo que permite evaluar cualquier conjunto de acciones legales en un estado dado.

El modelo se presenta como resultado de aprendizaje por refuerzo (tag `reinforcement-learning`), pero la model card afirma explicitamente que el proceso de entrenamiento no forma parte de esta release: no se detallan datos, numero de pasos, composicion del dataset, ni si hubo ajuste por preferencias. Tampoco se documentan innovaciones tecnicas de decodificacion o atencion. La unica innovacion descrita esta en el lado de la inferencia: el puente aplica un criterio de desempate determinista (opciones a menos de 0,0001 de la mejor cuentan como empatadas y se toma la primera) y una busqueda opcional en combates de elite y jefe que reevalua las mejores opciones sobre copias del combate con las cartas futuras redibujadas.

## Capacidades

- Juego completo de Slay the Spire como Ironclad: seleccion de cartas a jugar y de sus objetivos, uso de pociones, eleccion de recompensas de carta, reliquias, eventos, tiendas, descansos y ruta en el mapa.
- Puntuacion de opciones legales mediante logits, con soporte para un numero variable de opciones y de tamano de lote.
- Estimacion del resultado de la run mediante dos salidas auxiliares (`value`, `bvalue`) usadas por el panel del bot y por la busqueda.
- Busqueda local en combates de elite y jefe: prueba las mejores opciones sobre copias del combate y elige la de mejor resultado medio.
- Determinismo entre ejecuciones gracias a la regla de desempate del puente.
- No soporta tool calling, function calling, agentes genericos, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues.

## Casos de uso

- Evaluacion de agentes de refuerzo en juegos de cartas: el modelo sirve como politica de referencia para comparar algoritmos de RL en un dominio con decisiones secuenciales, informacion parcial y gestion de recursos a largo plazo.
- Investigacion sobre busqueda en inferencia: la combinacion de politica neuronal con busqueda limitada en combates de elite y jefe permite estudiar el compromiso entre coste computacional y tasa de victoria.
- Benchmark reproducible de planificacion a largo plazo: las 220 semillas fijas (5800001 a 5800228) y el criterio de conteo de victorias ofrecen un protocolo cerrado para medir mejoras de agentes.
- Automatizacion de partidas y generacion de datos: el bot puede jugar runs completas para producir trazas de estados, acciones y resultados utiles para entrenar o validar otros modelos.
- Analisis de estrategia y balance: las puntuaciones por opcion y las estimaciones de valor permiten inspeccionar que decisiones considera mejores el agente en cada estado, util para estudiar el meta del juego.
- Integracion en herramientas de asistencia al jugador: el puente y el panel pueden adaptarse para mostrar recomendaciones en tiempo real durante una partida.
- Docencia en aprendizaje por refuerzo aplicado: el paquete incluye simulador, modelo y puente, lo que facilita montar practicas sobre politica, valor y busqueda con un caso real medido.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---|
| Victorias sobre 220 semillas fijas (run no terminada cuenta como derrota) | 65 de 220 (29,5 %) |
| Victorias sobre runs terminadas | 65 de 215 (30,2 %) |
| Error estandar | aproximadamente 3 puntos porcentuales |
| Runs no terminadas | 5 de 220 (4 por perdida de seguimiento del puente, 1 por cierre de la ventana del juego) |
| Build medido | build anterior del paquete, macOS, mod SuperFastMode, sin busqueda, export ONNX anterior de los mismos pesos |
| Comprobaciones del paquete publicado (con busqueda) | 20 runs en macOS y 20 en Windows, sin tasa de victoria calculable |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la tasa de victorias descrita. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas con otros agentes.

## Requisitos de hardware

- El fichero ONNX ocupa 92 MB con unos 22 millones de parametros, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU.
- VRAM estimada: no disponible de forma oficial; por tamano de pesos, el modelo completo requiere del orden de decenas o pocos cientos de MB en funcion del framework y del tamano de lote.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime es suficiente. No hay requisitos de A100 ni H100.
- Despliegue: ONNX Runtime a traves del puente Spire Bot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: la model card indica que la busqueda tarda unos segundos en algunos pasos de combates de elite y jefe; no se da latencia ni throughput de la inferencia directa.
- Entorno medido: macOS y Windows con el juego real y el mod SuperFastMode para acelerar animaciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes de Slay the Spire ni modelos comparables en parametros, contexto o rendimiento. Como referencia interna, el propio modelo sin busqueda alcanza un 29,5 % de victorias en Ascension 20 con Ironclad, pero no hay cifras de terceros para contrastar.

## Limitaciones y advertencias

- Solo juega con Ironclad. Aunque el paquete permite fijar niveles de Ascension inferiores, el comportamiento en ellos no se ha medido.
- Solo conoce el juego base: no soporta cartas, reliquias, monstruos ni eventos de mods.
- La busqueda anade varios segundos de latencia en algunos pasos de combates de elite y jefe.
- A veces termina un turno con energia y cartas jugables disponibles, y a veces juega por segunda vez un poder ya activo (Barricade, Corruption).
- El proceso de entrenamiento no forma parte de la release, lo que limita la reproducibilidad del modelo.
- La tasa de victorias publicada corresponde a un build anterior sin busqueda; el paquete publicado solo se ha comprobado con 20 runs por plataforma, insuficientes para estimar su rendimiento.
- Riesgo de alucinacion y sesgos: no aplica en el sentido habitual, pero la politica puede tomar decisiones suboptimas o repetir acciones; no hay analisis de sesgos.
- Licencia CC BY 4.0: permite uso comercial con atribucion ("Spire Bot model by xLychee"); hay que citar al autor y enlazar la licencia.
- Proyecto no afiliado a Mega Crit, desarrolladora de Slay the Spire.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xlychee/spire-bot
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Slay the Spire (Mega Crit): no disponible en la informacion proporcionada
- Repositorio del paquete Spire Bot, paper o blog del autor: no disponible en la informacion proporcionada
