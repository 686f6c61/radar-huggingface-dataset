# ymelka/tiny-voca-french

## Resumen

tiny-voca-french es un modelo de síntesis de voz (text-to-speech) en francés desarrollado por el usuario ymelka, construido sobre el framework tiny-voca. Se trata de un modelo extremadamente compacto: 4.534.219 parámetros en total, incluyendo el generador de forma de onda, entrenado desde cero sobre 55,6 horas de audio en francés. Su relevancia radica en la eficiencia: funciona aproximadamente 30 veces más rápido que el tiempo real sobre cuatro hilos de CPU, lo que lo hace apto para despliegues en entornos sin GPU.

El modelo ofrece cinco voces (F1, M1, GF2, NM y SW), cuatro de ellas sintéticas generadas con Qwen3-TTS y Gemini TTS, y una (SW) aprendida de grabaciones reales del corpus SIWIS. La entrada de texto se convierte a fonemas mediante eSpeak NG con reglas adicionales específicas del francés que corrigen liaison, elisión y lecturas erróneas. La salida es audio mono a 24 kHz.

Con licencia Apache-2.0 y un tamaño de repositorio mínimo, el modelo se posiciona como una alternativa ligera para aplicaciones de TTS en francés donde el coste computacional y el tamaño del modelo son críticos, sacrificando naturalidad y expresividad frente a sistemas de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (generador de forma de onda incluido; detalles internos no disponibles) |
| Parametros totales | 4.534.219 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa el texto oración a oración, sin límite declarado) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32) |

## Arquitectura y entrenamiento

El modelo se basa en el framework tiny-voca, un sistema de TTS ligero que incluye el generador de forma de onda dentro del propio modelo. No se especifican en la información disponible los detalles internos de la arquitectura (tipo de encoder de fonemas, decoder acústico, vocoder). El modelo se entrenó desde cero, sin pesos preentrenados, durante 90.351 pasos sobre dos GPUs T4.

El entrenamiento utilizó 58.557 clips que suman 55,6 horas de audio en francés. Las fuentes de audio son Qwen3-TTS-12Hz-1.7B (Apache-2.0) para las voces F1 y M1, Gemini TTS para GF2 y NM, y grabaciones del corpus SIWIS para SW. Los textos provienen del recolector de frases de Common Voice (CC0), los prompts de SIWIS (CC BY 4.0) y plantillas propias para números, fechas, horas y precios. Cada clip se alineó forzosamente a sus fonemas y se descartaron los que el alineador no pudo colocar. Las frases de validación y test nunca aparecen en entrenamiento. La entrada se fonemiza con eSpeak NG versión 1.51 más reglas francesas que corrigen liaison, elisión y errores de lectura.

## Capacidades

- Síntesis de voz en francés a partir de texto, con salida mono a 24 kHz.
- Cinco voces seleccionables: F1 (femenina), M1 (masculina), GF2 (femenina), NM (masculina) y SW (femenina).
- Control de velocidad de habla mediante el parámetro `--speed`.
- Control de tono mediante `--pitch-shift` (desplazamiento en log F0; 0,058 equivale aproximadamente a un semitono) y `--pitch-range` (escala del movimiento tonal alrededor de la media).
- Procesamiento de texto de cualquier longitud: se lee oración a oración.
- Expansión de títulos como « M. » y lectura de números en palabras por parte de eSpeak NG.
- Reglas francesas específicas para liaison, elisión y corrección de lecturas erróneas de eSpeak NG.
- No soporta tool calling, agentes, visión ni audio de entrada.
- No dispone de modo de razonamiento ni capacidades multilingües más allá del francés.

## Casos de uso

- Lectura de textos largos en francés: el modelo procesa el texto oración a oración, por lo que puede narrar artículos, documentos o libros completos sin límite de longitud, con velocidad ajustable y control de tono.
- Sistemas de accesibilidad en tiempo real: al ejecutarse unas 30 veces más rápido que el tiempo real en cuatro hilos de CPU, puede integrarse en lectores de pantalla o aplicaciones de asistencia para personas con discapacidad visual sin requerir GPU.
- Generación de avisos y anuncios automatizados: con plantillas propias para números, fechas, horas y precios, es adecuado para sistemas de megafonía, transporte público o atención telefónica que generan locuciones dinámicas en francés.
- Prototipado rápido de interfaces de voz: su tamaño de 18,2 MB en disco y su licencia Apache-2.0 permiten incorporarlo en entornos de desarrollo y pruebas sin coste de infraestructura.
- Síntesis de voz para contenido educativo: las cinco voces permiten alternar narradores en cursos, audiolibros o materiales de aprendizaje de francés, con control de velocidad para adaptarse al nivel del estudiante.
- Despliegue en dispositivos de borde: al caber en CPU y no requerir GPU, puede ejecutarse en Raspberry Pi, routers o sistemas embebidos para aplicaciones de voz locales sin conexión.
- Generación de audio para pruebas de pipelines de ASR: al ser determinista y rápido, puede producir corpus sintéticos en francés para evaluar sistemas de reconocimiento de voz.

## Benchmarks y rendimiento

La información disponible solo incluye una evaluación de inteligibilidad: el modelo lee frases fijas y un modelo ASR (jonatasgrosman/wav2vec2-large-xlsr-53-french) transcribe la salida. No se proporcionan los resultados numéricos de esta evaluación en el texto disponible, ni datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

| Benchmark | Resultado |
|---|---|
| Inteligibilidad (ASR) | resultados numéricos no disponibles en la información proporcionada |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo pesa 18,2 MB en float32 y se ejecuta en CPU.
- GPU recomendadas: no necesarias; el entrenamiento se realizó en dos T4, pero la inferencia está optimizada para CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: el paquete `tiny-voca` (rama `french` del fork de yoch, tag `french-v1`), instalable vía pip desde Git. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 30 veces más rápido que el tiempo real sobre cuatro hilos de CPU.
- Requisito adicional: eSpeak NG versión 1.51 instalado en el sistema (`apt install espeak-ng` en Debian y Ubuntu).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca-french | 4,5 M | no disponible | fr | Apache-2.0 | Hugging Face |
| Qwen3-TTS-12Hz-1.7B | 1,7 B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Gemini TTS | no disponible | no disponible | no disponible | propietaria | API de Google |
| SIWIS (corpus) | no aplica (dataset) | no aplica | fr | CC BY 4.0 | no disponible |

La comparación directa con alternativas de TTS en francés de tamaño similar no está disponible en la información proporcionada. Qwen3-TTS y Gemini TTS se citan como fuentes de audio de entrenamiento, no como alternativas evaluadas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo solo soporta francés; no es multilingüe.
- La voz SW, aprendida de un hablante real, es la menos inteligible de las cinco según la model card.
- Las voces F1, M1, GF2 y NM son sintéticas y no imitan a ninguna persona real; SW deriva de grabaciones publicadas bajo CC BY 4.0, lo que puede requerir atribución según el uso.
- El audio de entrenamiento no se publica, lo que limita la reproducibilidad y la auditoría del dataset.
- La evaluación se limita a inteligibilidad mediante ASR; no se han publicado métricas de naturalidad, prosodia ni MOS.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la fonemización con eSpeak NG puede producir lecturas incorrectas en palabras no cubiertas por las reglas francesas, especialmente con versiones distintas de eSpeak NG 1.51.
- El modelo no incluye mecanismos de seguridad ni filtrado de contenido; el texto de entrada se sintetiza tal cual.
- La licencia Apache-2.0 permite uso comercial, pero la procedencia del audio de entrenamiento (Qwen3-TTS, Gemini TTS, SIWIS) debe verificarse para cumplir con las condiciones de las fuentes originales.
- No se dispone de información sobre sesgos de género, edad o acento en las voces.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/ymelka/tiny-voca-french
- Código (rama french del fork): https://github.com/yoch/tiny-voca/tree/french-v1
- Repositorio original tiny-voca: https://github.com/n4ze3m/tiny-voca
- Modelo ASR de evaluación: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french
- Pesos: https://huggingface.co/ymelka/tiny-voca-french/resolve/main/tiny-voca-french.pt
- Muestras de audio: https://huggingface.co/ymelka/tiny-voca-french/resolve/main/samples/F1-2.wav
