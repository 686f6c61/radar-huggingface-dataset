# venkycs/laya-telugu

## Resumen

Laya (లయ) es un modelo de síntesis de voz (text-to-speech) para telugu coloquial con mezcla de inglés, el fenómeno conocido como Tinglish o code-mixing, que refleja cómo se habla realmente en contextos cotidianos. Lo desarrolla venkycs como proyecto independiente y se distribuye en Hugging Face bajo licencia CC-BY-4.0. La versión publicada es la 0.2, fechada el 16 de noviembre de 2026, y se presenta explícitamente como un modelo pequeño y ligero orientado a ejecución en CPU de portátil, no como un sistema de calidad de estudio.

Técnicamente es un modelo de 22,5 millones de parámetros que combina un modelo acústico Matcha-TTS (flow matching) con un vocoder Vocos. Parte de un preentrenamiento sobre habla telugu de estudio leída por dos hablantes (conjunto Rasa) y opera sobre un conjunto fijo de 78 símbolos, leyendo un carácter por paso. Dispone de dos voces, femenina y masculina, y de dos estilos de lectura (`read` y `conv`).

Su relevancia actual reside en el nicho: la mayoría de sistemas TTS para lenguas índicas no manejan bien el code-mixing telugu-inglés ni el texto informal (números, fechas, puntuación laxa, telugu escrito con alfabeto latino). Laya aborda ese problema no cambiando el modelo sino limpiando y normalizando el texto de entrada mediante un léxico editable, lo que permite mantener el conocimiento adquirido en el preentrenamiento. El autor advierte que la precisión es comparable a la del modelo de partida (1,8 % frente a 2,1 % de error en lectura de vuelta) y que no dispone de control emocional funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico, flow matching) + vocoder Vocos |
| Parametros totales | 22,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | telugu (te) e inglés (en), con foco en code-mixing telugu-inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en dos etapas propia de la familia Matcha-TTS: un modelo acústico basado en flow matching que transforma la secuencia de símbolos de entrada en representaciones acústicas intermedias, y un vocoder Vocos que convierte esas representaciones en forma de onda de audio. El modelo acústico tiene 22,5 millones de parámetros y trabaja sobre un vocabulario fijo de 78 símbolos, leyendo un carácter por paso. El punto de partida es un preentrenamiento sobre habla telugu de estudio leída por dos hablantes (conjunto Rasa).

La innovación técnica declarada no está en la arquitectura sino en el preprocesado del texto. Dado que el conjunto de símbolos es fijo y modificarlo invalidaría el aprendizaje previo, el autor mantiene el vocabulario y limpia la entrada antes del modelo mediante `laya_tokenizer.py` y un léxico editable (`laya_lexicon.json`): las palabras en inglés, los números, las fechas, la puntuación informal y el telugu escrito con letras latinas se convierten a escritura telugu pronunciable (por ejemplo, "tension" → టెన్షన్, "2:30" → రెండు ముప్పై). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz en telugu coloquial con inserción natural de palabras en inglés (Tinglish), incluyendo frases mixtas del tipo "One minute, నేను ఇప్పుడే check చేస్తాను".
- Dos voces seleccionables: femenina y masculina.
- Dos estilos de lectura: `read` (lectura) y `conv` (algo más conversacional).
- Control de velocidad mediante el parámetro `--speed` (1,15 corresponde al ritmo habitual de Laya; 1,0 es más pausado).
- Control de la pausa final mediante `--tail-ms` (por defecto 300 ms).
- Normalización de texto previa a la síntesis: conversión de palabras inglesas, números, fechas, puntuación informal y telugu transliterado al alfabeto latino a escritura telugu.
- Léxico editable para corregir la pronunciación de palabras concretas.
- Ejecución en CPU de portátil, sin necesidad de GPU.
- No dispone de control emocional funcional; la expresividad de los ejemplos proviene del texto, el ritmo, las pausas y la elección de voz, no del modelo.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Atención al cliente automatizada en telugu: el modelo puede leer respuestas con disculpas, consultas de pedidos, horarios y descuentos mezclando términos ingleses habituales en el sector, como demuestra el ejemplo `call-center.wav` (43 s, voz femenina a velocidad 1,1). Es adecuado porque el habla de mostrador real incorpora anglicismos que un TTS puramente telugu pronunciaría mal.
- Asistente sanitario o de seguimiento de tratamiento: lectura pausada de indicaciones médicas, horarios de medicación y cifras con voz masculina calmada (velocidad 1,0), como en `doctor.wav` (40 s). La velocidad ajustable y la normalización de números facilitan la comprensión de dosis y tiempos.
- Contenido educativo y refuerzo escolar: explicación de lecciones, formulación de preguntas y frases de ánimo con voz femenina cálida (velocidad 1,05), según `teacher.wav` (49 s). Encaja en aplicaciones de repaso o lectura de materiales para estudiantes que aprenden en un entorno bilingüe telugu-inglés.
- Contenido de entretenimiento y horóscopos: lectura de los రాశి ఫలాలు semanales para los doce signos con voz masculina estable (velocidad 1,0), como en `rasi-phalalu.wav` (74 s). El modelo sostiene textos largos de forma aceptable dentro de su rango de calidad.
- Asistentes conversacionales informales y chat de voz: respuestas casuales y afectuosas con estilo `conv` y velocidad 1,1, según `girlfriend.wav` (36 s). Útil en prototipos de compañía conversacional o mensajería con voz donde el registro coloquial importa más que la locución perfecta.
- Accesibilidad y lectura de notificaciones: convertir avisos, recordatorios y mensajes cortos ("రేపు morning పది గంటలకి meeting ఉంది, మర్చిపోకు") en audio en un portátil sin GPU, gracias a sus 22,5 M de parámetros y su ejecución en CPU.
- Prototipado e investigación en TTS para lenguas índicas: al ser un modelo pequeño con licencia permisiva y pesos safetensors, sirve como base para experimentar con normalización de texto code-mixed, léxicos editables y voces en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta una comparación interna de error de lectura de vuelta: 1,8 % para Laya frente a 2,1 % para el modelo del que parte, y señala que la mejora no es claramente perceptible para un oyente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecutarse en CPU, por lo que no requiere VRAM dedicada.
- GPU recomendadas: no disponibles; no se documenta ningún requisito de GPU.
- Cabe en GPU de consumo: sí, con margen amplio dado su tamaño (22,5 M de parámetros y un repositorio de 0,2 GB), aunque el caso de uso declarado es la CPU.
- Opciones de despliegue: el repositorio incluye `speak.py` (CLI) y una API de Python (`load`, `say`) que dependen de `torch`, `numpy`, `safetensors` y `huggingface_hub`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Code-mixing | Licencia | Ejecución en CPU |
|---|---|---|---|---|---|
| Laya Telugu (venkycs) | 22,5 M | te, en | Sí (telugu-inglés) | CC-BY-4.0 | Sí, objetivo declarado |
| Modelo base Rasa (preentrenamiento) | no disponible | te | No documentado | no disponible | no disponible |
| Otros TTS índicos (p. ej. familia Indic-TTS) | no disponible | varias lenguas índicas | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo de partida citado por el autor (Rasa, habla telugu de estudio de dos hablantes), del que no se detallan parámetros, licencia ni condiciones de despliegue. No se dispone de datos verificables sobre alternativas comparables de la misma categoría.

## Limitaciones y advertencias

- Calidad limitada: el autor indica que es claro en frases cortas y cotidianas y que su precisión es aproximadamente la del modelo de partida, sin mejora claramente perceptible para un oyente.
- Sin control emocional funcional: no puede sonar realmente alegre, triste o enfadado por sí mismo; la expresividad depende del texto, el ritmo, las pausas y la elección de voz.
- Cobertura restringida a telugu e inglés; no se documenta soporte para otras lenguas índicas ni para variedades dialectales del telugu.
- Dependencia de la normalización de texto: palabras mal pronunciadas requieren añadir su grafía telugu al léxico (`laya_lexicon.json`); con `--raw` se omite la limpieza y el modelo puede fallar en palabras inglesas, números o fechas.
- Vocabulario fijo de 78 símbolos, lo que limita la entrada a lo que ese conjunto puede representar tras la normalización.
- Riesgo de alucinación acústica y de pronunciación incorrecta en nombres propios, siglas, términos técnicos o palabras fuera del léxico; no se han publicado métricas objetivas de naturalidad (MOS) ni de inteligibilidad más allá del error de lectura de vuelta.
- Sesgos: no se documentan análisis de sesgo de género, dialecto o prosodia; las dos voces disponibles proceden de un corpus de habla leída de dos hablantes, lo que puede limitar la variedad de acentos.
- Estado del proyecto: versión 0.2, proyecto independiente y descrito como "privado por ahora"; no hay garantía de mantenimiento, soporte ni estabilidad de la API.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del corpus de preentrenamiento (Rasa) antes de desplegar en producción.
- Sin datos publicados de latencia, throughput ni consumo de recursos, por lo que las estimaciones de producción deben medirse en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/venkycs/laya-telugu
- Logotipo del proyecto: https://huggingface.co/venkycs/laya-telugu/resolve/main/logo/laya-logo.svg
- Ejemplos de uso (`samples/usecases/`): https://huggingface.co/venkycs/laya-telugu/tree/main/samples/usecases
- Guiones de los ejemplos (`scripts.json`): https://huggingface.co/venkycs/laya-telugu/resolve/main/samples/usecases/scripts.json
- Muestras cortas (`samples/side-by-side/`): https://huggingface.co/venkycs/laya-telugu/tree/main/samples/side-by-side
