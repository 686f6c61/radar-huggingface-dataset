# YukiKaze1337/DaFeiYu_rvc_v2_40k

## Resumen

DaFeiYu_rvc_v2_40k es un modelo de conversión de voz (voice-to-voice) entrenado con el framework RVC v2 a 40 kHz, publicado por el usuario YukiKaze1337 en HuggingFace. No es un modelo de texto a voz ni un modelo de lenguaje: es un checkpoint de generador (`dafeiyu.pth`, 53 MB) más un índice faiss de recuperación de características (`added_IVF1314_Flat_nprobe_1_dafeiyu_v2.index`, 154 MB) que se usan junto con el pipeline de inferencia de RVC para transformar una locución o una interpretación cantada de entrada en la voz objetivo «大肥鱼» (Da Fei Yu).

El interés técnico del artefacto está en su naturaleza de modelo de nicho y en los detalles de su entrenamiento: 227 fragmentos (~11,1 minutos) de audio sintético generado mecánicamente, no de una persona real, con f0 activado y exportado en un checkpoint de aproximadamente 2,33 millones de pasos. Es un caso representativo del ecosistema RVC, donde proliferan modelos de voz de pocos minutos de material, y sirve para evaluar la viabilidad de la conversión de voz con recursos mínimos y con material de partida libre de derechos de intérprete.

Relevante ahora sobre todo por dos motivos prácticos: ocupa menos de 0,2 GB en repositorio y se puede ejecutar en hardware muy modesto, lo que lo hace útil como banco de pruebas de pipelines de conversión en tiempo real o por lotes. Ahora bien, el autor advierte explícitamente de que 11 minutos de material es poco para RVC, de que los tonos agudos y las notas sostenidas pueden «desafinar» y de que el uso previsto es personal, de aprendizaje y no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (conversión de voz basada en recuperación de características; generador tipo NSF-HiFiGAN con f0) |
| Parametros totales | No disponible. El checkpoint del generador ocupa 53 MB, lo que sugiere del orden de 13-14 M de parámetros en fp32; el autor no publica la cifra |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: modelo audio-a-audio; la conversión se hace por segmentos/ventanas, no por contexto de tokens |
| Tipos de cuantizacion | No disponible. Checkpoint en PyTorch (`.pth`, fp32); no se publican versiones fp16, GGUF ni ONNX |
| Idiomas soportados | Chino (`zh`) según los metadatos; el material de entrenamiento es voz sintética en ese idioma |
| Licencia | `mit` en los metadatos de HuggingFace, pero la model card restringe el uso a personal, aprendizaje, entretenimiento y creación derivada no comercial (contradicción no resuelta por el autor) |
| Formato de pesos | `.pth` (PyTorch, `torch.load` con campos `weight/config/info/sr/f0/version`) + índice faiss `.index` |
| Frecuencia de muestreo | 40 kHz |
| Uso de f0 (pitch) | Sí, `f0=1`; el autor recomienda `rmvpe` como extractor de pitch |
| Numero de speakers | 109 en `emb_g` (reservados); en la práctica solo se usa `speaker 0` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

RVC v2 es un pipeline de conversión de voz en dos etapas: primero se extraen representaciones de contenido (codificador tipo HuBERT/ContentVec) y la curva de f0 del audio de entrada; después un generador condicionado por esas características y por un embedding de hablante sintetiza la forma de onda a la frecuencia de muestreo del modelo. El índice faiss actúa como memoria de recuperación: sustituye o mezcla los vectores de contenido de entrada por los más cercanos del entrenamiento, lo que mejora la similitud de timbre a costa de fidelidad al contenido original. En este caso el índice es `IVF1314_Flat` con `nprobe=1`, 51.267 vectores de 768 dimensiones.

Los datos de entrenamiento son 227 fragmentos, aproximadamente 11,1 minutos en total, de voz sintetizada mecánicamente: no hay grabaciones de una persona real, lo que elimina el problema de derechos de intérprete pero introduce las limitaciones acústicas propias de un TTS de origen. El autor indica un checkpoint de ~2.333.333 pasos (`D_2333333.pth` / `G_2333333.pth`) y entrenamiento/exportación el 26 de octubre de 2026. No se documenta composición del dataset más allá de esa descripción, ni se menciona RLHF, DPO ni ajuste por preferencias (no aplica a este tipo de modelo). Tampoco se detalla la configuración de entrenamiento (batch, learning rate, número de épocas efectivas).

## Capacidades

- Conversión de voz voz-a-voz (speech-to-speech) manteniendo el contenido lingüístico y el ritmo de la entrada.
- Conversión de voz cantada (singing voice conversion) gracias al uso explícito de f0, con control de tono mediante el parámetro `--pitch` en semitonos.
- Preservación de prosodia y timing: el modelo no genera habla nueva, transforma la existente, por lo que la duración y las pausas se conservan.
- Extracción de pitch con varios métodos (el autor recomienda `rmvpe`; el framework admite otros como `harvest` o `pm`).
- Mejora de similitud de timbre mediante recuperación en índice faiss (opcional, activable en inferencia).
- Salida en formatos de audio convencionales (el ejemplo del autor usa `--format wav`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No es un modelo TTS: no acepta texto como entrada.
- Capacidades multilingües: no documentadas; los metadatos declaran solo `zh`.

## Casos de uso

- Doblaje y localización de contenido propio: convertir la locución de un actor de voz con derechos cedidos a un timbre concreto, procesando por lotes con `infer/cli.py` y `--pitch` ajustado por sexo del material de origen.
- Postproducción de maquetas musicales: aplicar el timbre del modelo a una pista vocal guía para previsualizar cómo sonaría una producción antes de contratar al intérprete final.
- Prototipado de pipelines de conversión de voz: con 0,2 GB de repositorio y un generador de 53 MB, es un banco de pruebas barato para validar cadenas RVC (extracción de f0, indexado faiss, remuestreo a 40 kHz) antes de pasar a modelos con más material.
- Creación de contenido para comunidades de modding y fandub: sustituir la voz de un personaje en clips propios, siempre que la licencia del material original lo permita y sin suplantar identidad real (el material de entrenamiento es sintético).
- Investigación sobre calidad con datos escasos: caso de estudio reproducible de qué se obtiene con ~11 minutos y 227 clips, útil para comparar curvas de calidad frente a modelos entrenados con horas de audio.
- Conversión en tiempo real en demostraciones: el tamaño reducido permite integrarlo en flujos de voice changer sobre GPU de gama media, con la latencia dominada por el extractor de pitch y el chunking del framework más que por el generador.
- Pruebas de robustez de índices faiss: comparar inferencia con y sin índice para medir la ganancia real de similitud frente a la pérdida de inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, similitud de hablante tipo SECS, error de f0, WER sobre audio convertido) ni comparaciones cuantitativas con otros checkpoints RVC.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1-2 GB para el generador de 53 MB a 40 kHz; en la práctica el cuello de botella es el codificador de contenido y el extractor de pitch, no el generador. Cifra no publicada por el autor; se deduce del tamaño del checkpoint.
- Memoria RAM: cargar el índice faiss de 154 MB con 51.267 vectores de 768 dimensiones requiere varios cientos de MB adicionales.
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 3050/3060, RTX 4060, T4). Para procesamiento por lotes de muchas pistas, una RTX 4090 o A100 reduce el tiempo total, aunque el modelo no las aprovecha por capacidad.
- CPU: viable para inferencia offline; el framework RVC funciona sin GPU, con latencia por segmento notablemente mayor.
- Cabe en GPU de consumo: sí, en el espectro bajo (GTX 1650 4 GB en adelante, con margen).
- Opciones de despliegue: RVC WebUI (colocando `dafeiyu.pth` en `assets/weights/` y el `.index` en `assets/indices/` o `logs/`), la CLI oficial del repositorio RVC (`infer/cli.py`), y variantes del ecosistema RVC para conversión en tiempo real. No hay pesos en GGUF ni ONNX publicados para llama.cpp u Ollama (no aplica).
- Latencia y throughput: no disponibles. El autor solo advierte de un problema de entorno: en macOS, faiss y torch usando OpenMP simultáneamente pueden provocar violación de segmento, y recomienda `OMP_NUM_THREADS=1` antes de la inferencia.
- Recomendación de pitch del autor: `--pitch 12` (una octava arriba) para material de voz masculina y `--pitch 0` para femenina.

## Comparativa con modelos similares

Los datos de las alternativas no están verificados en la información proporcionada; se incluyen como referencia general del ecosistema, no como cifras confirmadas.

| Modelo | Tipo | Frecuencia | Datos de entrenamiento | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DaFeiYu_rvc_v2_40k (este) | RVC v2, voz y canto, con f0 | 40 kHz | 227 clips sintéticos, ~11,1 min, 2,33 M pasos | Audio a audio por segmentos | `mit` en metadatos, uso no comercial en la card | HuggingFace, 0 descargas, 0 likes |
| RVC v2 genérico (otros checkpoints de la comunidad) | RVC v2 | 32-48 kHz según checkpoint | Variable; habitualmente 10 min a varias horas | Audio a audio por segmentos | Variable por autor (MIT o restrictiva) | Amplia en HuggingFace |
| So-VITS-SVC (4.x) | SVC con f0, orientado a canto | 44,1 kHz | Requiere dataset mayor para estabilidad | Audio a audio por segmentos | AGPL/otros según fork | Repositorios de la comunidad |
| Modelos zero-shot de conversión de voz | Encoder + decoder con embeddings de hablante | 16-24 kHz típicamente | Corpus multihablante a gran escala | Audio a audio con referencia | Variable | Repositorios de investigación |

Diferencias destacables: este modelo es el más ligero y el más pobre en datos de la comparativa; su ventaja es la ausencia de voz real en el entrenamiento (menos fricción de derechos) y su licencia MIT declarada, en tensión con la restricción no comercial del README.

## Limitaciones y advertencias

- Material de entrenamiento escaso: 11,1 minutos y 227 clips. El propio autor advierte de inestabilidad en notas agudas y sonidos sostenidos («音色稳定但高音和长音可能会飘»).
- Origen sintético del audio: el timbre aprendido procede de un TTS mecánico, por lo que puede sonar artificial y arrastrar artefactos del generador de origen.
- Contradicción de licencia: los metadatos declaran `mit`, pero la model card restringe el uso a personal, aprendizaje, entretenimiento y creación derivada no comercial. Ante uso comercial, la restricción escrita prevalece como advertencia; conviene contactar con el autor antes de desplegar.
- Riesgo de suplantación: es un modelo de conversión de identidad vocal. La propia card prohíbe hacerse pasar por otras personas y usarlo para fraude, falsificación o vulneración de derechos. No debe emplearse para generar audio que se atribuya a un hablante real sin consentimiento.
- Idioma: solo se declara `zh`; no hay evaluación de comportamiento con entradas en castellano ni en otros idiomas.
- Indexado: el índice es `IVF1314_Flat` con `nprobe=1`, es decir, búsqueda aproximada con un único cluster explorado; prioriza velocidad sobre exhaustividad y puede degradar la similitud en voces alejadas del material de entrenamiento.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad; no hay demos publicadas.
- Restricciones de entorno: en macOS, conflicto OpenMP entre faiss y torch que puede causar violación de segmento; requiere `OMP_NUM_THREADS=1`.
- No apto para TTS ni para tareas de lenguaje: no acepta texto ni produce razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de artefactos acústicos y de «inventar» contenido espectral en tramos donde la señal de entrada es ruidosa o el pitch es extremo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YukiKaze1337/DaFeiYu_rvc_v2_40k
- Dataset y paper del modelo: no disponibles en la información proporcionada.
- Blog o demo del autor: no disponibles.
- Repositorio de referencia del framework (dependencia de ejecución, no enlazado por el autor): RVC — Retrieval-based-Voice-Conversion-WebUI, https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- Repositorio de referencia del extractor de pitch recomendado: RMVPE (incluido en el ecosistema RVC).
- Índice faiss: incluido en el repositorio como `added_IVF1314_Flat_nprobe_1_dafeiyu_v2.index`.
