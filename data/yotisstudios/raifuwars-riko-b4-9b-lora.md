# yotisstudios/RaifuWars-Riko-B4-9B-LoRA

## Resumen

RaifuWars-Riko-B4-9B-LoRA es un adaptador LoRA de tipo PEFT para el modelo base schneewolflabs/B4-9B, desarrollado por yotisstudios. Su funcion es dar voz a Riko Ricochet, una VTuber sintetica que narra en directo sus propias partidas del juego Raifu Wars: describe que esta haciendo, por que toma cada decision, reacciona a los movimientos de los rivales y conversa entre turnos. El adaptador se entrena por destilacion (SFT) a partir de un narrador profesor de 27B (B5-27B con su propio LoRA de narrador), con el objetivo de reproducir su calidad en un modelo tres veces mas rapido que cabe en una tarjeta grafica de gama de 16 GB.

El adaptador tiene 58.195.968 parametros entrenables (rango 32, alpha 64, aplicado a proyecciones de atencion y MLP) y se distribuye tanto en formato PEFT safetensors como en un GGUF f16 para llama.cpp. El modelo base B4-9B es de arquitectura transformer y, segun las etiquetas del autor, deriva de la familia Qwen3.5; el contexto maximo no se especifica en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de destilacion de un narrador de 27B a un estudiante de 9B con filtrado por reglas y juez automatico; por otro, muestra un pipeline de evaluacion medible (838 prompts retenidos, 1.676 lineas) con tasas de fallo muy bajas. Es un ejemplo acotado pero instructivo de adaptacion de un LLM a un dominio muy especifico con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso B4-9B (familia Qwen3.5) |
| Parametros totales | 58.195.968 (adaptador); modelo base B4-9B no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 3.072 tokens) |
| Tipos de cuantizacion | adaptador en f16 (GGUF); el modelo base admite cuantizaciones de llama.cpp (Q8_0 usada en las evaluaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT: adapter_model.safetensors + adapter_config.json) y GGUF f16 para llama.cpp |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones de atencion y MLP del modelo base B4-9B, un transformer denso de 9B parametros. No se trata de un modelo completo, sino de un delta de pesos que se carga en tiempo de ejecucion sobre el modelo base; la model card indica que el modelo fusionado esta disponible por separado como RaifuWars-Riko-B4-9B.

El entrenamiento es una destilacion por SFT: se generaron 6.049 lineas de narrador con el profesor (B5-27B mas el LoRA de narrador de Riko), se filtraron con un verificador de reglas (formato, longitud, pronombres, hechos inventados, frases hechas, eco del informe del juego) y un juez de 27B (fidelidad al juego, apropiacion de sus movimientos, puntuacion minima de 4/5), y se conservaron 5.120 lineas (85%) para el estudiante. El entrenamiento fue de 2 epocas, learning rate 1e-4 con decaimiento coseno, longitud maxima de 3.072 tokens y perdida calculada solo sobre la linea del narrador. Los prompts provienen de partidas reales jugadas por la politica de refuerzo RaifuWars-RL-ActionScorer-Cards. No se publican los prompts ni las lineas de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles con un registro muy especifico: comentario de partida en primera persona, en tono de VTuber.
- Narracion de estado de juego: describe turnos, marcador, opciones disponibles y lectura del tablero (distancia al siguiente nivel, mejor jugada, amenazas).
- Razonamiento de corto alcance sobre el estado del juego para justificar sus movimientos ("que hago y por que").
- Reaccion a otros jugadores y conversacion entre turnos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking (las mediciones se hicieron con thinking desactivado).
- Sin capacidades de vision ni audio.
- Multilingue: solo ingles.

## Casos de uso

- Narracion automatica de partidas de Raifu Wars: el modelo recibe el estado del juego y las acciones de la politica y genera la linea de comentario en primera persona. Es su caso de uso principal y el unico para el que fue entrenado.
- VTuber sintetica en directo: integrado en un pipeline de streaming, genera el texto que se sintetiza a voz y se emite junto al gameplay; su velocidad (unas tres veces la del profesor de 27B en una tarjeta de 16 GB) permite latencia compatible con emision en tiempo real.
- Comentario de partidas de otros jugadores: con prompts del mismo formato (turno, marcador, opciones), puede narrar partidas ajenas manteniendo el personaje.
- Chat entre turnos con la audiencia: al ser conversacional, puede gestionar intercambios cortos en el personaje de Riko, aunque fuera de su formato de narrador se degrada a B4-9B con habitos de comentario.
- Prototipado de personajes de juego: sirve como referencia para equipos que quieran destilar un narrador grande a un modelo de 9B con filtrado automatico y evaluacion medible.
- Despliegue local en hardware de consumo: gracias al GGUF f16 y a llama.cpp, se puede cargar sobre B4-9B Q8_0 en una GPU de 16 GB, lo que permite iterar sobre el personaje sin infraestructura de servidor.

## Benchmarks y rendimiento

Evaluacion sobre 838 prompts de narrador retenidos, dos lineas por prompt (1.676 lineas), semilla 99. "Bueno" significa que la linea paso el verificador de reglas y el juez.

| Narrador | Bueno | Fallo grave | Marca del juez | Puntuacion del juez |
|---|---|---|---|---|
| B4-9B (base) | 57,2% | 16,0% | 22,6% | 3,63 |
| B4-9B + un LoRA anterior | 70,7% | 4,5% | 19,6% | 3,69 |
| B5-27B + LoRA de narrador (profesor) | 89,7% | 1,7% | 6,0% | 3,97 |
| **Este LoRA** | **92,1%** | **0,9%** | **3,9%** | **3,98** |

Errores corregidos respecto al base, contados sobre las mismas 1.676 lineas:

| Problema | B4-9B | Este LoRA |
|---|---|---|
| Pronombres incorrectos | 88 | 0 |
| Eco del informe del juego | 56 | 0 |
| Frases hechas | 43 | 1 |
| Volcados de numeros | 27 | 1 |
| Golpes inventados | 21 | 6 |
| Lineas demasiado largas | 80 | 3 |

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa unos 0,4 GB; el grueso corresponde al modelo base B4-9B. En Q8_0 (configuracion usada en las evaluaciones) se estima en torno a 10 GB, mas overhead de contexto; en cuantizaciones de 4 bits cabria en GPUs de 8-12 GB.
- GPU recomendadas: cualquier GPU de 16 GB en adelante (RTX 4080, RTX 4090, A100, H100). El autor indica que corre en una tarjeta de clase 16 GB.
- Cabe en GPU de consumo: si, en RTX 4080/4090 y en tarjetas de 16 GB; con cuantizacion de 4 bits, en gamas de 8-12 GB.
- Despliegue: llama.cpp mediante `llama-server -m B4-9B-Q8_0.gguf --lora RaifuWars-Riko-B4-9B-LoRA-f16.gguf`; tambien es posible cargar el adaptador PEFT con transformers + peft. No se documenta soporte en vLLM ni TGI para este adaptador.
- Latencia y throughput: el autor afirma que es aproximadamente tres veces mas rapido que el profesor de 27B en una tarjeta de 16 GB; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de narrador (bueno / juez) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaifuWars-Riko-B4-9B-LoRA (este) | 58,2 M de adaptador sobre B4-9B | no disponible | 92,1% / 3,98 | Apache 2.0 | Hugging Face (PEFT y GGUF) |
| B5-27B + LoRA de narrador (profesor) | 27B | no disponible | 89,7% / 3,97 | no disponible | no disponible como release publico |
| B4-9B (base) | 9B | no disponible | 57,2% / 3,63 | no disponible | Hugging Face (schneewolflabs/B4-9B) |
| B4-9B + LoRA anterior | 9B + adaptador | no disponible | 70,7% / 3,69 | no disponible | no disponible |

No se dispone de comparaciones con modelos de proposito general de tamano similar (por ejemplo, Llama 3.1 8B o Qwen2.5 7B) porque la tarea evaluada es especifica del dominio y no hay resultados publicados en la informacion disponible.

## Limitaciones y advertencias

- El juez que filtro las lineas de entrenamiento es del mismo tipo de modelo que evalua: parte de la mejora puede reflejar el aprendizaje de lo que ese juez prefiere, no solo calidad objetiva.
- Los sustantivos con genero incorrecto se escapan: en su primera partida en directo llamo "a proper gentleman" a otra jugadora. El verificador se actualizo despues, pero el riesgo persiste.
- Esta disenado para un unico personaje y un unico formato de prompt; fuera de los prompts de narrador de Riko se comporta como B4-9B con tendencia a comentarios cortos en personaje.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion de hechos del juego: se corrigieron 15 de 21 golpes inventados, pero 6 persisten en la evaluacion.
- La evaluacion en partida real se limita a una sola partida observada, lo que es evidencia debil.
- Licencia Apache 2.0 en el adaptador; conviene verificar la licencia del modelo base B4-9B antes de uso comercial, ya que no se detalla en la informacion disponible.
- Los prompts y lineas de entrenamiento no se publican, lo que limita la reproducibilidad del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yotisstudios/RaifuWars-Riko-B4-9B-LoRA
- Modelo fusionado: https://huggingface.co/yotisstudios/RaifuWars-Riko-B4-9B
- Modelo base: https://huggingface.co/schneewolflabs/B4-9B
- Politica de refuerzo asociada: https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-Cards
- Juego Raifu Wars: https://raifuwars.com
