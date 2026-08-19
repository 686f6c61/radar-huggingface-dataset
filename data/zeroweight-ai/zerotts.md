# zeroweight-ai/ZeroTTS

## Resumen

ZeroTTS es un modelo de síntesis de voz (text-to-speech) en vietnamita desarrollado por zeroweight-ai, especializado en clonación de voz zero-shot. Su principal característica es que todo el pipeline de inferencia está implementado con numpy y ONNX Runtime, sin dependencias de PyTorch ni CUDA, lo que permite ejecutarlo en CPU de portátil o incluso en navegador. El modelo se distribuye bajo licencia MIT y está pensado para integrarse fácilmente en aplicaciones de producción mediante el paquete `zerotts`.

El modelo resuelve el problema de la síntesis de voz vietnamita de alta calidad con clonación de voz a partir de una referencia breve, incluyendo soporte para code-switching vietnamita-inglés y generación cross-lingual (voz extranjera hablando vietnamita). Según los benchmarks publicados en ZeroBench-TTS, consigue una tasa de error de palabra (WER) del 1,03% frente al 16-18% de los finetunes vietnamitas de XTTS-v2, con una naturalidad medida por UTMOS de 2,91. El repositorio tiene un tamaño de 0,9 GB y está disponible en formato ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline numpy + ONNX Runtime) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), con code-switching vietnamita-inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no indicado) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (no especifica si se trata de un transformer, difusión u otro tipo de red). Lo único confirmado es que el pipeline completo de inferencia está implementado con numpy y ONNX Runtime, sin PyTorch ni CUDA, lo que implica que el modelo se distribuye en formato ONNX y puede ejecutarse en entornos sin GPU. No se proporcionan datos sobre el número de parámetros, la composición del dataset de entrenamiento ni el proceso de entrenamiento (RLHF, DPO, etc.). El modelo referencia un paper en arXiv con ID 2602.10934, aunque su contenido no está disponible en la información proporcionada.

## Capacidades

- Síntesis de voz zero-shot: genera habla en vietnamita a partir de un texto y una voz de referencia breve, sin necesidad de entrenamiento adicional.
- Clonación de voz: reproduce el timbre del hablante de referencia con una similitud media de 0,936 (coseno WavLM-SV) según el benchmark oficial.
- Code-switching vietnamita-inglés: maneja textos que alternan entre vietnamita e inglés dentro de la misma frase con un WER del 0,97%.
- Generación cross-lingual: produce vietnamita a partir de una voz de referencia extranjera, con WER del 1,42%.
- Manejo de casos difíciles: acrónimos, fechas, porcentajes y monedas, con WER del 1,75%.
- Inferencia en streaming: primer fragmento de audio en aproximadamente 100 ms, con salida float32 a 48 kHz.
- Ejecución ligera: funciona en CPU de portátil y en navegador, sin necesidad de GPU.

## Casos de uso

- Atención al cliente automatizada en vietnamita: el modelo puede generar respuestas de voz en tiempo real para IVR o chatbots telefónicos, con latencia inicial de 100 ms y ejecución en CPU, lo que reduce costes de infraestructura.
- Audiolibros y contenido narrado: permite convertir libros o artículos a voz vietnamita natural, manteniendo una voz consistente durante largas sesiones gracias a la clonación zero-shot.
- Asistentes de voz y dispositivos embebidos: al no requerir GPU, puede desplegarse en dispositivos de bajo consumo o en el navegador para asistentes personales en vietnamita.
- Doblaje y localización de contenido: clonación de voces para doblar vídeos o podcasts al vietnamita, incluyendo pasajes en inglés mediante code-switching.
- Accesibilidad para personas con discapacidad visual: síntesis de voz vietnamita de alta inteligibilidad (WER 0,16% en texto plano) para lectores de pantalla.
- Generación de contenido educativo: producción de materiales de aprendizaje de vietnamita o de cursos bilingües vietnamita-inglés con voces sintéticas.
- Pruebas de producto y prototipado: integración en pipelines de desarrollo para validar flujos de voz sin necesidad de locutores humanos, gracias a la licencia MIT y al formato ONNX.

## Benchmarks y rendimiento

Los resultados oficiales, declarados por el autor y medidos sobre el dataset ZeroBench-TTS (137 ítems, 59 voces de referencia retenidas, 4 subconjuntos), comparan ZeroTTS con dos finetunes públicos vietnamitas de XTTS-v2. La puntuación se realizó con el scorer publicado del benchmark, y el WER es el mínimo entre dos sistemas ASR (whisper-large-v3 y PhoWhisper-large).

| Metrica | ZeroTTS | XTTS-v2-vietnamse | viXTTS |
|---|---|---|---|
| WER (%) ↓ | 1,03 | 16,42 | 18,40 |
| Naturalidad (UTMOS) ↑ | 2,91 | 2,43 | 2,35 |
| Similitud de voz (coseno) ↑ | 0,936 | 0,940 | 0,935 |
| Silencio muerto (s) ↓ | 0,029 | 0,532 | 0,233 |

WER por subconjunto:

| Subconjunto | Descripcion | ZeroTTS | XTTS-v2-vietnamse | viXTTS |
|---|---|---|---|---|
| `vietnamese` | vietnamita plano | 0,16% | 7,92% | 9,56% |
| `code_switch` | vietnamita + inglés incrustado | 0,97% | 10,94% | 9,25% |
| `cross_lingual` | voz extranjera → vietnamita | 1,42% | 21,37% | 27,27% |
| `challenging` | acrónimos, fechas, %, moneda | 1,75% | 27,86% | 31,85% |

El autor señala que la similitud de voz es un empate estadístico entre los tres modelos, y que en el subconjunto `cross_lingual` ZeroTTS queda por detrás en fidelidad del timbre (0,911 frente a ~0,935). Además, cuando se proporciona el texto hablado en lugar de la ortografía cruda, XTTS mejora a 7,27% y viXTTS a 8,61%, mientras que ZeroTTS mejora a 0,56%, manteniendo una ventaja de 13-15×. Los errores restantes de ZeroTTS están auditados en el repositorio, principalmente ceros a la izquierda en fechas y nombres de letras W/H.

## Requisitos de hardware

- Inferencia en CPU: la model card afirma que el pipeline completo funciona en CPU de portátil sin necesidad de CUDA ni PyTorch.
- VRAM: no aplica para inferencia en CPU; no se proporcionan datos de uso de memoria.
- GPU recomendada: ninguna en particular; el modelo está diseñado para entornos sin GPU.
- Compatibilidad con hardware de consumo: sí, cualquier portátil o dispositivo con soporte de ONNX Runtime debería ser suficiente.
- Opciones de despliegue: ONNX Runtime (numpy + onnxruntime), con posibilidad de ejecución en navegador; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: primer audio en aproximadamente 100 ms en modo streaming; throughput no especificado.

## Comparativa con modelos similares

La comparativa se basa en los datos publicados en la model card, que enfrenta a ZeroTTS con dos finetunes vietnamitas de XTTS-v2 (XTTS-v2-vietnamse y viXTTS). No se dispone de información sobre otros modelos comparables en la misma categoría.

| Modelo | WER (%) | UTMOS | Similitud de voz | Silencio muerto (s) | Licencia |
|---|---|---|---|---|---|
| ZeroTTS | 1,03 | 2,91 | 0,936 | 0,029 | MIT |
| XTTS-v2-vietnamse | 16,42 | 2,43 | 0,940 | 0,532 | no disponible |
| viXTTS | 18,40 | 2,35 | 0,935 | 0,233 | no disponible |

ZeroTTS supera claramente a ambos en WER y naturalidad, empata en similitud de voz y reduce el silencio muerto en un orden de magnitud. Su ventaja principal es la ejecución sin GPU y la licencia MIT, frente a los finetunes de XTTS-v2 que dependen de Coqui TTS y tienen requisitos de hardware mayores.

## Limitaciones y advertencias

- Idioma: el modelo está orientado exclusivamente al vietnamita; no se garantiza calidad en otros idiomas fuera del code-switching con inglés.
- Fidelidad cross-lingual: en el subconjunto `cross_lingual`, la similitud de voz es inferior (0,911 frente a ~0,935 de los baselines), lo que indica que el timbre de voces extranjeras se transfiere con menos precisión al vietnamita.
- Errores conocidos: se han documentado fallos en la lectura de fechas con ceros a la izquierda y en los nombres de las letras W y H, según el análisis `HIGH_WER_ANALYSIS.md`.
- Sesgos y alucinaciones: no se ha publicado información sobre sesgos del modelo ni sobre comportamiento ante entradas fuera de distribución.
- Madurez: el modelo tiene muy pocas descargas (27) y ningún like en HuggingFace, lo que sugiere una adopción temprana y una validación comunitaria limitada.
- Uso comercial: la licencia MIT permite uso comercial, pero la clonación de voces de personas reales puede estar sujeta a regulaciones de protección de datos y derechos de imagen; el usuario debe verificar la legalidad de cada caso.
- Documentación incompleta: no se especifican arquitectura, parámetros, dataset de entrenamiento ni requisitos de memoria, lo que dificulta la evaluación técnica profunda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeroweight-ai/ZeroTTS
- Repositorio de código y demo: https://github.com/zeroweight-ai/ZeroTTS
- Dataset de benchmark: https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS
- Paper (arXiv): https://arxiv.org/abs/2602.10934
- Análisis de errores de alto WER: https://github.com/zeroweight-ai/ZeroTTS/blob/main/evaluation/HIGH_WER_ANALYSIS.md
- Resultados completos: https://github.com/zeroweight-ai/ZeroTTS/blob/main/evaluation/RESULTS.md
