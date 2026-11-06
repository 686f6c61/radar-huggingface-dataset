# Tabahi/mbfa-latin-noEnglish

## Resumen

mbfa-latin-noEnglish es un codificador de fonemas y alineador forzado (forced aligner) basado en una CNN sin contexto, desarrollado por Tabahi como parte de la familia p4mbfa, sucesora de CUPE / p3cupe. No es un modelo de lenguaje: su función es segmentar audio en fonemas y producir alineamientos temporales entre una secuencia de fonemas conocida y una señal de voz. Cada fotograma de 5 ms se clasifica usando como máximo 120 ms de audio (campo receptivo de 38,9 ms), lo que impide estructuralmente que el modelo aprenda la fonotáctica de ningún idioma concreto.

El modelo se entrenó sobre el grupo de lenguas "latin" de FLEURS excluyendo el inglés, con aproximadamente 266 de las 273,5 horas disponibles. Cubre 35 variedades lingüísticas (afrikáans, azerí, bosnio, catalán, checo, galés, danés, alemán, español de Latinoamérica, estonio, finés, filipino, francés, irlandés, gallego, húngaro, indonesio, islandés, italiano, luxemburgués, lituano, maorí, malayo, maltés, noruego bokmål, neerlandés, polaco, portugués de Brasil, rumano, eslovaco, esloveno, sueco, suajili, turco y uzbeko).

Su relevancia radica en que ofrece alineamiento fonético multilingüe con resolución sub-fotograma y un tamaño reducido (14,9 millones de parámetros, repo de 0,1 GB), lo que lo hace desplegable en entornos con recursos limitados. La innovación clave es que la segmentación se obtiene mediante un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precisión sub-fotograma en el cruce de posteriores vecinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free), codificador de fonemas con tres cabezas (`ph`, `phg`, `tone`); decodificador de Viterbi segmental para alineamiento |
| Parametros totales | 14.875.189 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; campo receptivo de 38,9 ms y ventana máxima de 120 ms por fotograma de 5 ms |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | af, az, bs, ca, cs, cy, da, de, es-419, et, fi, fil, fr, ga, gl, hu, id, is, it, lb, lt, mi, ms, mt, nb, nl, pl, pt-BR, ro, sk, sl, sv, sw, tr, uz (35 variedades) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (modelo principal); checkpoint de entrenamiento en formato PyTorch Lightning (pickle) |

## Arquitectura y entrenamiento

La arquitectura es una CNN sin contexto que clasifica cada fotograma de 5 ms a partir de un máximo de 120 ms de audio, con un campo receptivo efectivo de 38,9 ms. El modelo tiene tres cabezas: `ph` (208 etiquetas con los tokens locales del grupo latin, incluyendo `<blank>`, `SIL`, `noise` y `<unk>`), `phg` (15 grupos de fonemas oro compartidos por todos los grupos de idiomas) y `tone` (22 valores de tono, compartidos pero no entrenados, ya que ningún idioma de este grupo tiene capa tonal). Los límites entre fonemas se obtienen con un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precisión sub-fotograma en el cruce de posteriores vecinas.

El entrenamiento se realizó sobre FLEURS latin sin inglés (excluyendo en-US), con aproximadamente 266 de 273,5 horas y un nivel de ruido de 0,05 (aproximadamente 26 dB de SNR). El checkpoint corresponde al experimento `ma05a`, época 4, seleccionado por F1@25ms en TIMIT sobre la mitad "tune" de una sonda de 400 clips (mejor de 9 épocas registradas). Se entrenó desde pesos aleatorios. Las etiquetas son pronunciaciones de diccionario de standard_g2p (inventario oro `9438371ed6dd`), no transcripciones fonéticas de lo realmente pronunciado.

## Capacidades

- Reconocimiento de fonemas a nivel de fotograma (5 ms) con tres cabezas de clasificación.
- Alineamiento forzado entre una secuencia de fonemas conocida y audio mono a 16 kHz.
- Segmentación fonética con precisión sub-fotograma en los límites.
- Codificación de audio en log-posteriores por fotograma para las tres cabezas (`aligner.encode`).
- Multilingüe: 35 variedades del grupo latin, con tokens compartidos vía standard_g2p.
- Capacidad de fine-tuning: se puede reutilizar el tronco y la cabeza `phg` compartida para entrenar un nuevo grupo de idiomas.
- No soporta tool calling, agentes, generación de texto, visión ni audio generativo; es un modelo puramente discriminativo de alineamiento.

## Casos de uso

- Alineamiento forzado para corpus de habla: dado un audio y su transcripción fonemizada con standard_g2p, el modelo produce los tiempos de inicio y fin de cada fonema, útil para construir corpus fonéticamente anotados a escala en 35 variedades.
- Anotación de datasets de TTS: permite obtener duraciones por fonema para entrenar modelos de síntesis de voz en idiomas con pocos recursos (maorí, maltés, luxemburgués, islandés), donde el modelo cubre lenguas sin herramientas comerciales.
- Investigación fonética computacional: la CNN sin contexto no puede aprender fonotáctica, lo que permite estudiar efectos acústicos locales de forma aislada y comparar entre lenguas con el mismo inventario de tokens.
- Evaluación de sistemas G2P: al alinear la salida de un conversor grafema-fonema contra audio real, se pueden detectar errores de pronunciación en el diccionario de forma automática.
- Preprocesado para pipelines de reconocimiento de voz: la segmentación fonética a nivel de 5 ms puede alimentar modelos acústicos o sistemas de verificación de pronunciación.
- Enseñanza de idiomas y evaluación de pronunciación: la precisión sub-fotograma en los límites (error absoluto medio de 16,11 ms en TIMIT) permite señalar desviaciones temporales en la producción del alumno.
- Extracción de características acústicas: `encode` devuelve log-posteriores por fotograma que pueden servir como representación intermedia para tareas posteriores de clasificación o segmentación.

## Benchmarks y rendimiento

Evaluación sobre 400 clips de TIMIT (inglés, nunca visto en entrenamiento). Cada clip se fonemiza con standard_g2p, se alinea y se comparan las onsets predichas con las fronteras etiquetadas a mano. La mitad "tune" seleccionó el checkpoint; la mitad "holdout" no participó en la selección.

| Metrica | Valor |
|---|---|
| `timit_f1_25ms_tune` | 71,9 |
| `timit_f1_25ms_holdout` | 71,77 |
| `timit_f1_25ms_nobonus_holdout` | 65,53 |
| `timit_f1_10ms_holdout` | 53,96 |
| `timit_abs_err_ms_holdout` | 16,11 |

La métrica `nobonus` alinea sin el bonus de onset sobre log-mel, lo que aísla la contribución propia de la red. El autor señala que estos resultados en TIMIT se obtienen sobre un idioma que el modelo nunca escuchó, y que igualan a mbfa-latin (71,70 en holdout), que sí se entrenó con inglés.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en FP32; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 1 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en CPU para clips cortos.
- Opciones de despliegue: la librería propia `p4mbfa` (clonando el repositorio `tabahi/bfa_models` y ejecutando desde su raíz); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| mbfa-latin-noEnglish | 14,9 M | 120 ms por fotograma de 5 ms | CNN sin contexto + Viterbi segmental | AGPL-3.0 | Excluye inglés del entrenamiento; F1@25ms holdout 71,77 en TIMIT |
| mbfa-latin | no disponible | no disponible | CNN sin contexto + Viterbi segmental | no disponible | Entrenado con inglés; F1@25ms holdout 71,70 en TIMIT |
| CUPE / p3cupe | no disponible | no disponible | Predecesor de p4mbfa | no disponible | Antecesor arquitectónico directo según la model card |

No se dispone de datos de otros alineadores forzados comparables (Montreal Forced Aligner, WhisperX, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones fonéticas reales; el modelo aprende a alinear lo que el diccionario dice, no lo que se pronunció.
- La cabeza `tone` está presente pero no entrenada: ningún idioma del grupo latin tiene capa tonal, por lo que no debe usarse para lenguas tonales.
- El modelo no puede aprender fonotáctica por diseño (campo receptivo de 38,9 ms), lo que limita su uso en tareas que requieran contexto lingüístico amplio.
- Los resultados en TIMIT se obtienen sobre inglés, un idioma no visto en entrenamiento; el rendimiento en las 35 lenguas objetivo no se reporta con métricas propias.
- El checkpoint de entrenamiento es un pickle de PyTorch Lightning: solo debe cargarse si se confía en el repositorio.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y servicios en red; debe revisarse antes de uso comercial o integración en productos propietarios.
- Riesgo de alucinación en el sentido de asignar fonemas a segmentos de audio ruidoso o sin habla; el decodificador de Viterbi fuerza una segmentación aunque la señal no contenga los fonemas indicados.
- Solo se ha validado con audio mono a 16 kHz; otras frecuencias de muestreo requieren remuestreo previo.
- El modelo tiene 31 descargas y 0 likes en Hugging Face, sin validación comunitaria independiente documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tabahi/mbfa-latin-noEnglish
- Repositorio de código: https://github.com/tabahi/bfa_models
- standard_g2p (CharsiuG2P): https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: google/fleurs (https://huggingface.co/datasets/google/fleurs)
