# thalovant/guezilo-wakeword

## Resumen

Guezilo-wakeword es un detector de palabra de activación (wake word) para el término "Guézilo", pronunciado /ɡe.zi.lo/ con la "u" muda. Lo desarrolla el usuario thalovant como una cabeza ONNX de 0,9 MB entrenada sobre las características en streaming de TigreGotico/wakehubert-tiny en cuantización int8, dentro del ecosistema wakeforge y OpenVoiceOS (OVOS). El modelo está marcado explícitamente como superseded: fue sustituido por thalovant/zoguilo-wakeword y se conserva únicamente con fines comparativos.

El problema que aborda es el de la detección local de una palabra clave concreta en audio continuo, con un umbral calibrado para un objetivo de falsos positivos de 0,5 por hora. Su relevancia es limitada por su estado de retirada: la model card documenta que, sintetizado con TTS, se aproximaba a 121 de 1.768 frases cortas comunes en 7 idiomas (frente a 62 de la versión sustituta) y que se activaba con más frecuencia sobre habla en francés.

La información disponible no incluye detalles sobre el corpus de entrenamiento, la arquitectura interna de la cabeza de clasificación ni el número de parámetros del modelo base. Los datos publicados se centran en métricas de evaluación de falsos positivos y recall sobre hablantes no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza ONNX de clasificación sobre características en streaming de wakehubert-tiny (int8) |
| Parametros totales | no disponible (pesos del artefacto: 0,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, sin ventana de texto) |
| Tipos de cuantizacion | int8 (modelo base cuantizado); el artefacto se distribuye como ONNX |
| Idiomas soportados | fr, en, es, pt, it, de, nl, pl, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una cabeza de clasificación exportada a ONNX que opera sobre las características extraídas por TigreGotico/wakehubert-tiny, un extractor basado en HuBERT de tamaño reducido y cuantizado a int8. El pipeline declarado es audio-classification y el artefacto distribuido pesa 0,9 MB, lo que lo hace apto para inferencia en streaming dentro del plugin `ovos-ww-plugin-wakeforge` de OpenVoiceOS.

La model card indica que los datos y el método de entrenamiento son los mismos que los de Zoguilo, pero no detalla el número de tokens de audio, la composición del corpus, el uso de aumento de datos ni si hubo ajuste fino supervisado con ejemplos negativos. Tampoco se documenta ninguna innovación técnica adicional más allá del propio pipeline de wakeforge sobre características congeladas del modelo base.

## Capacidades

- Detección de la palabra de activación "Guézilo" (/ɡe.zi.lo/) en audio continuo en streaming.
- Clasificación binaria de audio (activación / no activación) sobre características de wakehubert-tiny.
- Funcionamiento multilingüe declarado para fr, en, es, pt, it, de, nl, pl y ro, con rendimiento desigual entre idiomas.
- Integración directa con OVOS mediante `ovos-ww-plugin-wakeforge` y configuración por JSON de hotwords.
- Umbral de decisión configurable; el valor por defecto es 0,512, calibrado sobre habla de desarrollo para 0,5 falsos despertares por hora.
- No soporta tool calling, agentes, generación de texto, visión ni razonamiento multi-paso: es un clasificador de audio especializado.

## Casos de uso

- Asistente de voz local en OVOS: el modelo se declara como hotword en la configuración del asistente y se ejecuta sobre el flujo de audio del micrófono, activando la escucha cuando detecta "Guézilo" con un coste computacional mínimo gracias a sus 0,9 MB.
- Evaluación comparativa de detectores de wake word: al conservarse como referencia frente a Zoguilo, sirve para reproducir los informes `eval.json` y `plugin_validation.json` y medir el impacto de cambios en el conjunto de negativos.
- Despliegue en dispositivos de recursos limitados: el formato ONNX int8 permite ejecución en CPU sin GPU en Raspberry Pi o hardware embebido similar, siempre que se acepte su tasa de falsos positivos.
- Investigación sobre confusiones fonéticas en wake words: los datos de proximidad a 121 frases cortas en 7 idiomas permiten estudiar pares mínimos como "es lo" en español o "je le" en francés.
- Pruebas de integración de plugins de OVOS: útil como caso de prueba para validar el cargador de hotwords y el pipeline de audio del plugin wakeforge.
- Referencia docente sobre calibración de umbrales: sus métricas de falsos despertares por hora y recall sobre hablantes no vistos ilustran el compromiso entre sensibilidad y especificidad en detección de keywords.

## Benchmarks y rendimiento

Métricas publicadas en la model card, con umbral por defecto 0,512 y falsos despertares medidos sobre 70,4 h de hablantes no vistos:

| Metrica | Guezilo | Zoguilo (sustituto) |
|---|---|---|
| Falsos despertares/h (todos los idiomas) | 0,61 | 0,64 |
| Falsos despertares/h (solo francés) | 1,09 | 0,80 |
| Voces TTS retenidas, tras silencio / tras habla | 93 % / 89 % | 93 % / 93 % |
| Hablantes OmniVoice | 98 % / 94 % | 96 % / 96 % |
| Hablantes reales con conversión de voz | 94 % / 90 % | 97 % / 95 % |
| Casi-aciertos aceptados | 0,3 % de 328 | 0 de 284 |
| Frases cortas comunes próximas (de 1.768, 7 idiomas) | 121 | 62 |
| Peor idioma | portugués: 1,6 falsos/h y 44-56 % en la única voz pt-BR retenida | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el artefacto ONNX ocupa 0,9 MB y el extractor base es un HuBERT tiny cuantizado a int8, por lo que la inferencia cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU dentro de OVOS.
- Cabe en GPU de consumo: sí, en cualquier GPU con soporte ONNX Runtime, aunque no es necesario.
- Opciones de despliegue: ONNX Runtime a través de `ovos-ww-plugin-wakeforge`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thalovant/guezilo-wakeword | no disponible (0,9 MB ONNX) | no aplica | 0,61 falsos/h; 121 frases próximas de 1.768 | Apache 2.0 | Hugging Face (superseded) |
| thalovant/zoguilo-wakeword | no disponible | no aplica | 0,64 falsos/h; 62 frases próximas de 1.768 | no disponible en la información | Hugging Face |
| TigreGotico/wakehubert-tiny | no disponible | no aplica | no disponible | no disponible en la información | Hugging Face (modelo base) |

No se dispone de datos de otros detectores de wake word comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo retirado: la model card lo marca como superseded y recomienda Zoguilo; no debería adoptarse en nuevos despliegues.
- Elevada confusión fonética: se aproxima a 121 de 1.768 frases cortas comunes en 7 idiomas, incluidas "es lo" en español y "je le" en francés, lo que provoca activaciones no deseadas en habla ordinaria.
- Sesgo de idioma: se activa con más frecuencia sobre habla en francés (1,09 falsos/h frente a 0,61 global).
- Mal rendimiento en portugués: 1,6 falsos despertares por hora y solo 44-56 % en la única voz pt-BR retenida.
- Acepta un 0,3 % de casi-aciertos (328 evaluados), frente a cero en el modelo sustituto.
- Las métricas de recall se calculan solo sobre clips que un modelo de fonemas confirma que pronuncian la palabra, lo que puede sobreestimar el rendimiento percibido en condiciones reales.
- No se documentan sesgos demográficos por acento, edad o género más allá de las pruebas con hablantes no vistos.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto retirado y con métricas inferiores, su idoneidad en producción es cuestionable.
- No hay información sobre latencia, consumo energético ni comportamiento en entornos con ruido de fondo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thalovant/guezilo-wakeword
- Modelo sustituto: https://huggingface.co/thalovant/zoguilo-wakeword
- Modelo base: https://huggingface.co/TigreGotico/wakehubert-tiny
- Repositorio wakeforge: https://github.com/TigreGotico/wakeforge
- Informe de evaluación: https://huggingface.co/thalovant/guezilo-wakeword/blob/main/eval.json
- Validación del plugin: https://huggingface.co/thalovant/guezilo-wakeword/blob/main/plugin_validation.json
