# Tabahi/mbfa-vietnamese

## Resumen

mbfa-vietnamese es un codificador de fonemas y alineador forzado (forced aligner) de tipo CNN sin contexto, desarrollado por Tabahi como sucesor de CUPE/p3cupe dentro del proyecto p4mbfa. No es un modelo generativo ni un LLM: su funcion es asignar etiquetas de fonema, grupo fonetico y tono a cada trama de 5 ms de audio, y a partir de esas posteriores derivar los limites temporales de cada telefono mediante un decodificador de Viterbi segmental. El modelo esta especializado en vietnamita y se distribuye con 14.708.114 parametros en formato safetensors.

La relevancia tecnica del diseno radica en su campo receptivo limitado: cada trama se clasifica usando como maximo 120 ms de audio (38,9 ms de campo receptivo efectivo), lo que impide que el modelo aprenda la fonotactica de ningun idioma concreto. Esto lo convierte en una pieza reutilizable para alineacion fonetica y segmentacion, con tres cabezas de salida (fonemas locales, grupos foneticos compartidos y tonos compartidos) entrenadas sobre FLEURS vietnamita.

El modelo esta pensado para integrarse en pipelines de procesamiento de voz que necesiten transcripcion fonetica alineada temporalmente, analisis de pronunciacion o generacion de datos de entrenamiento para sistemas TTS y ASR. Su licencia AGPL-3.0 condiciona fuertemente su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free), codificador de fonemas con decodificador Viterbi segmental |
| Parametros totales | 14.708.114 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; campo receptivo de 38,9 ms por trama (maximo 120 ms de audio por clasificacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (checkpoint de entrenamiento adicional en formato pickle de PyTorch Lightning) |

## Arquitectura y entrenamiento

El modelo es una red convolucional sin contexto que clasifica cada trama de 5 ms de audio de forma independiente, con un campo receptivo de 38,9 ms y un maximo de 120 ms de audio por decision. Dispone de tres cabezas: `ph` (45 etiquetas de tokens locales del vietnamita, incluyendo `<blank>`, `SIL`, `noise` y `<unk>`), `phg` (15 grupos foneticos gold compartidos entre todos los grupos de idioma) y `tone` (22 valores de tono compartidos). La segmentacion final se obtiene con un decodificador de Viterbi segmental sobre la secuencia de telefonos conocida, refinado a precision sub-trama en el cruce de posteriores vecinas.

El entrenamiento se realizo sobre las 8,7 horas completas de FLEURS vietnamita con un nivel de ruido de 0,02. El checkpoint corresponde al experimento `mv01a`, epoca 6, seleccionado por `val_loss` sobre el conjunto de validacion de FLEURS (mejor de 30 epocas; la epoca final alcanzo 3,602). El tronco y la cabeza `phg` provienen del modelo latin `ma02a` (epoca final), mientras que las cabezas `ph` y `tone` se entrenaron desde cero. Las etiquetas son pronunciaciones de diccionario generadas con standard_g2p (inventario gold `9438371ed6dd`), no transcripciones foneticas de lo realmente pronunciado.

## Capacidades

- Reconocimiento de fonemas a nivel de trama para vietnamita, con etiquetas locales del grupo de idioma.
- Alineacion forzada de una secuencia de telefonos conocida sobre un audio, devolviendo inicio y fin en milisegundos por token.
- Segmentacion con precision sub-trama mediante decodificador de Viterbi segmental.
- Clasificacion de grupos foneticos gold (15 clases) compartida entre grupos de idioma.
- Clasificacion de tonos (22 valores) con cabeza especifica del grupo.
- Extraccion de log-posteriores por trama de las tres cabezas mediante `aligner.encode(wav)`.
- Entrada de audio mono a 16 kHz.
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo: es un modelo discriminativo de alineacion.

## Casos de uso

- Analisis de pronunciacion en aprendizaje de vietnamita: el alineador devuelve los limites temporales de cada telefono, lo que permite comparar la duracion y secuencia producidas por el alumno con la pronunciacion de diccionario y senalar desviaciones.
- Generacion de datos de entrenamiento para TTS: a partir de un corpus de audio con transcripcion, el modelo produce alineaciones fonema-audio que sirven como etiquetas para entrenar modelos acusticos o de duracion.
- Evaluacion de sistemas ASR: las alineaciones forzadas permiten medir errores de temporizacion y de identidad de fonema de forma independiente al reconocimiento de palabras.
- Anotacion fonetica de corpus linguisticos: el modelo etiqueta cada trama con fonema, grupo y tono, facilitando la construccion de corpus anotados de vietnamita con 8,7 h de referencia FLEURS.
- Segmentacion para concatenative TTS o edicion de audio: los limites sub-trama permiten cortar unidades foneticas con precision inferior a la trama de 5 ms.
- Investigacion en fonetica computacional: el diseno sin contexto permite estudiar efectos locales de coarticulacion sin que el modelo imponga restricciones fonotacticas aprendidas.
- Reutilizacion del tronco para nuevos grupos de idioma: el checkpoint de entrenamiento permite inicializar el tronco y la cabeza `phg` compartida para entrenar otros grupos linguisticos de standard_g2p.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `val_loss` | 3,3472 |
| `val_frame_acc` | 0,2893 |
| `val_frame_acc_groups` | 0,4653 |
| `val_peak_ce_tone` | 0,879 |

Las metricas `val_*` se calculan sobre clips retenidos de FLEURS pero puntuados contra las propias alineaciones del modelo, ya que no existen etiquetas de limites fuera del ingles. Por tanto, miden autoconsistencia, no precision de limites. No se han publicado resultados de benchmarks comparativos con otros alineadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 14,7 M de parametros en fp32 (unos 59 MB de pesos); el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en CPU para audios cortos.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: el codigo oficial es el paquete `p4mbfa` del repositorio `tabahi/bfa_models`, que carga `config.json` y `model.safetensors` mediante `MbfaAligner.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mbfa-vietnamese | 14,7 M | campo receptivo 38,9 ms | vi | AGPL-3.0 | CNN sin contexto, tres cabezas, Viterbi segmental |
| CUPE / p3cupe (predecesor) | no disponible | no disponible | multilingue | no disponible | Antecesor directo del que hereda el diseno |
| Montreal Forced Aligner | no disponible | no disponible | multilingue | no disponible | Alineador clasico basado en HMM-GMM, ampliamente usado |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son pronunciaciones de diccionario generadas con standard_g2p, no transcripciones foneticas reales; el modelo aprende a alinear la forma canonica, no lo que se dijo.
- Las metricas de validacion miden autoconsistencia contra las propias alineaciones del modelo, no precision de limites real, por lo que no deben interpretarse como exactitud de segmentacion.
- `val_frame_acc` de 0,2893 es bajo en terminos absolutos; la precision a nivel de grupo fonetico sube a 0,4653.
- Solo se ha entrenado y validado en vietnamita; el autor indica que otros miembros del grupo podrian alinearse, pero no se ha probado.
- El modelo requiere conocer de antemano la secuencia de telefonos; no realiza reconocimiento libre de fonemas sin una transcripcion previa.
- Licencia AGPL-3.0: el uso en productos o servicios en red obliga a liberar el codigo fuente derivado, lo que restringe su adopcion en entornos propietarios.
- El checkpoint de entrenamiento se distribuye como pickle de PyTorch Lightning; solo debe cargarse si se confia en el repositorio.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de alineaciones incorrectas en audio con ruido, acentos no representados en FLEURS o habla espontanea.
- No se documentan sesgos especificos, aunque la composicion de FLEURS condiciona la cobertura de variedades dialectales del vietnamita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tabahi/mbfa-vietnamese
- Codigo de inferencia y entrenamiento (p4mbfa): https://github.com/tabahi/bfa_models
- standard_g2p (G2P y grupos de idioma): https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
