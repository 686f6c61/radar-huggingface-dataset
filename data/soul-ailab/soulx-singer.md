# Soul-AILab/SoulX-Singer

## Resumen

SoulX-Singer es un modelo de síntesis de voz cantada (singing voice synthesis, SVS) desarrollado por Soul-AILab (equipo de investigación de Soul APP) que permite generar voces cantadas realistas para cantantes no vistos durante el entrenamiento, es decir, en régimen zero-shot. El modelo resuelve el problema de la personalización vocal en producción musical y aplicaciones creativas, donde tradicionalmente se requería entrenar un modelo específico por cantante. Con SoulX-Singer basta una muestra de referencia para clonar el timbre y aplicar control melodico y de partitura.

El modelo admite dos modalidades de control: condicionamiento por melodía (contorno de F0) y condicionamiento por partitura (notas MIDI), lo que permite un control preciso de altura, ritmo y expresión. Está publicado bajo licencia Apache 2.0, con pesos en el repositorio de Hugging Face (5,6 GB), y soporta inglés y chino. La model card indica que está pensado para investigación académica, fines educativos y aplicaciones legítimas como síntesis vocal personalizada y tecnologías de asistencia.

La relevancia actual del modelo radica en que combina zero-shot voice cloning con SVS controlada por partitura, una capacidad poco común en modelos abiertos de esta categoría, y lo hace con una licencia permisiva que facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz cantada; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos descargables vía `huggingface_hub`; el repo ocupa 5,6 GB) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna (tipo de backbone, número de parámetros, mecanismo de atención o diseño del decodificador de audio). Se describe como un modelo de síntesis de voz cantada de alta fidelidad que opera en régimen zero-shot, con control condicionado por melodía (contorno de F0) y por partitura (notas MIDI). El pipeline declarado es `text-to-speech` y la librería asociada es `huggingface_hub`.

No se especifica en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO. Tampoco se detallan innovaciones técnicas concretas como decodificación especulativa o atención lineal. Existe un informe técnico y un paper (arXiv:2602.07803) que probablemente contienen estos detalles, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Síntesis de voz cantada de alta fidelidad con capacidad de clonación de voz zero-shot para cantantes no vistos.
- Control por melodía mediante contorno de F0, permitiendo definir altura y expresión de forma precisa.
- Control por partitura mediante notas MIDI, lo que permite alinear la síntesis con una partitura concreta.
- Generación de audio a partir de texto (pipeline `text-to-speech`).
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de audio).
- No se documentan capacidades de visión, audio de entrada o modo thinking.

## Casos de uso

- Producción musical asistida: el modelo permite generar pistas vocales a partir de una partitura MIDI y una muestra de referencia del cantante, facilitando maquetas y demos antes de la grabación real.
- Clonación de voz para doblaje cantado: con una muestra de referencia se puede generar la voz de un cantante en inglés o chino, útil para localización de canciones.
- Herramientas creativas para compositores: control por contorno de F0 permite experimentar con melodías e interpretaciones sin necesidad de un vocalista disponible.
- Tecnologías de asistencia: personas con dificultades del habla o del canto pueden utilizar su propia voz clonada para cantar, gracias al régimen zero-shot y a la licencia permisiva.
- Investigación en SVS: al ser Apache 2.0 y con pesos abiertos, sirve como base para experimentación académica en síntesis vocal y clonación zero-shot.
- Educación musical: generación de voces guía a partir de partituras MIDI para práctica de coro o entrenamiento auditivo.
- Prototipado rápido en aplicaciones de karaoke o generación musical: el pipeline text-to-speech y la descarga directa vía `huggingface_hub` simplifican la integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repo de pesos ocupa 5,6 GB, pero no se especifica el consumo en memoria durante la inferencia).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: descarga e inferencia mediante el repositorio oficial de GitHub (`Soul-AILab/SoulX-Singer`) con `example/infer.sh`; requiere además el modelo de preprocesado `Soul-AILab/SoulX-Singer-Preprocess`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de síntesis de voz cantada zero-shot.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte para otras lenguas.
- Riesgo de uso indebido por clonación de voz: la propia model card advierte que el modelo permite zero-shot voice cloning y debe usarse solo para investigación, educación y aplicaciones legítimas.
- Riesgo de alucinación no aplica en el sentido de texto, pero pueden aparecer artefactos o imprecisiones en la síntesis vocal que no están cuantificados en la información disponible.
- No se documentan sesgos específicos del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de uso responsable del autor recomienda evitar aplicaciones éticamente cuestionables.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.
- Dependencia de un modelo de preprocesado adicional (`SoulX-Singer-Preprocess`) para el pipeline completo.

## Enlaces

- Hugging Face: https://huggingface.co/Soul-AILab/SoulX-Singer
- Repositorio GitHub: https://github.com/Soul-AILab/SoulX-Singer
- Página de demo: https://soul-ailab.github.io/soulx-singer/
- Paper arXiv: https://arxiv.org/abs/2602.07803
- Informe técnico: https://github.com/Soul-AILab/SoulX-Singer/blob/main/assets/technical-report.pdf
- Modelo de preprocesado: https://huggingface.co/Soul-AILab/SoulX-Singer-Preprocess
