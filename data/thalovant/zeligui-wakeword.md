# thalovant/zeligui-wakeword

## Resumen

Zeligui es un detector de palabra de activación (wake word) para el asistente de voz OVOS (OpenVoiceOS), publicado por el usuario thalovant. Se trata de una cabeza ONNX de 0,9 MB que opera sobre las características en streaming del modelo TigreGotico/wakehubert-tiny cuantizado a int8, y se integra mediante el plugin `ovos-ww-plugin-wakeforge`. Detecta la palabra "Zéligui", pronunciada zé-li-gui /ze.li.ɡi/, en entornos multilingües.

El modelo está marcado como obsoleto (superseded) por su propio autor: fue sustituido por Zoguilo y se conserva únicamente con fines comparativos. El motivo del descarte es técnico y está documentado: la frase francesa "je lui dis" suena casi exactamente igual que la palabra, y el entrenamiento no logró corregir esa confusión. Por ello, el autor advierte explícitamente de que no debe usarse en contextos donde se hable francés.

La relevancia de esta ficha es, por tanto, doble: ilustra el funcionamiento de la familia de detectores wakeforge basados en wakehubert-tiny y sirve como caso de estudio de los límites de la detección de palabras clave con falsos positivos léxicos en lenguas cercanas. La licencia es Apache 2.0 y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza ONNX de clasificación sobre características en streaming de wakehubert-tiny (int8) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming) |
| Tipos de cuantización | int8 en el modelo base; cabeza ONNX de 0,9 MB |
| Idiomas soportados | fr, en, es, pt, it, de, nl, pl, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo no es un transformer completo, sino una cabeza de clasificación ONNX que consume las características en streaming extraídas por TigreGotico/wakehubert-tiny, un modelo de representación de audio de tipo HuBERT de tamaño reducido y cuantizado a int8. La cabeza, de 0,9 MB, se ejecuta a través del plugin `ovos-ww-plugin-wakeforge` dentro del ecosistema OVOS, lo que permite la detección continua de la palabra de activación con un coste computacional muy bajo.

Los datos y el método de entrenamiento son los mismos que los empleados en Zoguilo, según indica el autor, aunque no se detalla en la información disponible la composición exacta del dataset, el número de horas de audio ni si se aplicaron técnicas de aumento de datos o ajuste fino específicas. El umbral por defecto es 0,438, calibrado sobre habla de desarrollo para una tasa de 0,5 falsos despertares por hora.

## Capacidades

- Detección de la palabra de activación "Zéligui" (zé-li-gui, /ze.li.ɡi/) en audio en streaming.
- Clasificación de audio binaria (palabra presente o ausente) mediante una cabeza ONNX ligera.
- Soporte multilingüe declarado para francés, inglés, español, portugués, italiano, alemán, neerlandés, polaco y rumano.
- Integración nativa con OVOS a través de `ovos-ww-plugin-wakeforge` y configuración JSON de hotwords.
- Ejecución sobre características de wakehubert-tiny cuantizado a int8, orientada a dispositivos de bajos recursos.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de visión o audio más allá de la clasificación de la palabra clave.

## Casos de uso

- Activación de asistente de voz en OVOS: el modelo se configura como hotword en el fichero JSON del asistente y activa la escucha cuando detecta "Zéligui", con un consumo de recursos mínimo gracias a sus 0,9 MB.
- Evaluación comparativa de detectores de wake word: al conservarse como referencia frente a Zoguilo, permite reproducir los informes `eval.json` y `plugin_validation.json` y comparar tasas de falsos positivos entre ambos modelos.
- Investigación sobre falsos positivos léxicos: sirve como caso documentado de cómo una frase cotidiana en un idioma cercano ("je lui dis" en francés) degrada la precisión de un detector y de por qué el reentrenamiento no siempre resuelve el problema.
- Despliegue en dispositivos embebidos: la cabeza ONNX de 0,9 MB sobre características int8 puede ejecutarse en hardware limitado, útil para prototipos de domótica con voz.
- Pruebas de integración de plugins OVOS: permite validar el funcionamiento de `ovos-ww-plugin-wakeforge` en pipelines de asistentes de voz antes de migrar a Zoguilo.
- Docencia y demostraciones de keyword spotting: su tamaño reducido y su naturaleza de modelo obsoleto lo hacen adecuado para explicar el flujo completo de un detector de wake word, desde las características de audio hasta la decisión final.

## Benchmarks y rendimiento

El autor publica resultados comparativos entre Zeligui y Zoguilo, con el umbral por defecto de 0,438 para Zeligui. Los falsos despertares se miden sobre 70,4 horas de hablantes no vistos, y la recall solo cuenta clips que un modelo de fonemas confirma que pronuncian la palabra.

| Métrica | Zéligui | Zoguilo |
|---|---|---|
| Falsos despertares/h (todos) | 0,77 | 0,64 |
| Falsos despertares/h (francés) | 1,69 | 0,80 |
| Voces TTS reservadas, tras silencio / tras habla | 94 % / 89 % | 93 % / 93 % |
| Hablantes OmniVoice | 92 % / 85 % | 96 % / 96 % |
| Hablantes reales con conversión de voz | 86 % / 79 % | 97 % / 95 % |
| Casi-aciertos aceptados | 1,9 % de 375 | 0 de 284 |

Además, el autor indica que, pronunciado por TTS, Zeligui se aproximó a 186 de 1.768 frases cortas comunes en 7 idiomas, frente a 62 en el caso de Zoguilo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la cabeza ONNX ocupa 0,9 MB y el modelo base wakehubert-tiny está cuantizado a int8, por lo que el conjunto cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y dispositivos embebidos, aunque puede ejecutarse en cualquier GPU compatible con ONNX Runtime.
- Cabe en GPU consumer: sí, en cualquier modelo actual, e incluso en hardware sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime a través de `ovos-ww-plugin-wakeforge`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| thalovant/zeligui-wakeword | Cabeza ONNX sobre wakehubert-tiny int8 | 0,9 MB | 9 idiomas | Apache 2.0 | Obsoleto (sustituido por Zoguilo) |
| thalovant/zoguilo-wakeword | Cabeza ONNX sobre wakehubert-tiny int8 | no disponible | no disponible | no disponible | Activo, sucesor recomendado |
| TigreGotico/wakehubert-tiny | Modelo base de representación de audio | no disponible | no disponible | no disponible | Activo, modelo base |

No se dispone de datos de otros detectores de wake word comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo obsoleto: el autor lo marca explícitamente como superseded y recomienda no usarlo, sustituyéndolo por Zoguilo.
- Falsos positivos en francés: la frase "je lui dis" se confunde con la palabra y no se corrigió con entrenamiento; la tasa de falsos despertares en francés es de 1,69/h frente a 0,80/h de Zoguilo.
- Advertencia explícita del autor: no debe usarse en contextos donde se hable francés.
- Mayor tasa de casi-aciertos aceptados (1,9 % de 375) frente a Zoguilo (0 de 284), lo que indica menor precisión en la discriminación fina.
- Menor recall en hablantes reales con conversión de voz (86 % / 79 %) y en hablantes OmniVoice (92 % / 85 %) que su sucesor.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de activaciones espurias en audio conversacional con palabras fonéticamente cercanas.
- La información disponible no detalla sesgos por acento, edad o género de los hablantes, ni el rendimiento en condiciones de ruido.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo obsoleto se recomienda evaluar Zoguilo antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thalovant/zeligui-wakeword
- Sucesor recomendado (Zoguilo): https://huggingface.co/thalovant/zoguilo-wakeword
- Modelo base (wakehubert-tiny): https://huggingface.co/TigreGotico/wakehubert-tiny
- Repositorio wakeforge: https://github.com/TigreGotico/wakeforge
- Informe de evaluación: https://huggingface.co/thalovant/zeligui-wakeword/blob/main/eval.json
- Validación del plugin: https://huggingface.co/thalovant/zeligui-wakeword/blob/main/plugin_validation.json
