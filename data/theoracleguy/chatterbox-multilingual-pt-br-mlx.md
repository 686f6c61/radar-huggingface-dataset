# theoracleguy/Chatterbox-Multilingual-pt-br-MLX

## Resumen

Chatterbox-Multilingual-pt-br-MLX es una conversión al framework MLX del modelo de síntesis de voz ResembleAI/Chatterbox-Multilingual-pt-br, especializado en portugués brasileño con capacidad de clonación de voz. Lo publica el usuario independiente theoracleguy y está pensado para ejecutarse en Macs con Apple Silicon mediante la librería mlx-audio 0.6.1. El modelo conserva la precisión original de los pesos, sin cuantización, y mantiene los componentes del repositorio fuente: el modelo T3 V3 de portugués brasileño, el decodificador de voz y el tokenizador.

El modelo resuelve el problema de la síntesis de voz en portugués brasileño con clonación de voz a partir de una grabación de referencia, pero en el ecosistema MLX, lo que permite inferencia local en hardware Apple sin depender de CUDA. Con 677.696.431 parámetros y un repositorio de 2,7 GB, es un modelo de tamaño medio que cabe en la memoria unificada de muchos equipos Apple Silicon modernos.

Su relevancia actual es doble: por un lado, amplía la disponibilidad de Chatterbox Multilingual fuera del stack PyTorch; por otro, documenta un problema técnico concreto del conversor (pendiente de activación HiFT de 0,1 frente a 0,01 del decodificador oficial) que provoca distorsión y que requiere aplicar un parche en tiempo de ejecución. Es un artefacto de conversión, no un modelo entrenado desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox V3 (T3 + decodificador de voz HiFT + tokenizador de voz S3), convertida a MLX |
| Parametros totales | 677.696.431 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguno; pesos en precision original, sin cuantizar |
| Idiomas soportados | portugués brasileño (código `pt`, locale pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. La arquitectura subyacente es Chatterbox V3 de ResembleAI, compuesta por un modelo T3 para la generación de tokens de voz, un decodificador de voz basado en HiFT (vocoder) y un tokenizador de voz compartido (mlx-community/S3TokenizerV2, que se descarga automáticamente durante la inferencia). El voice encoder y el mapeo Cangjie provienen de ResembleAI/chatterbox; las revisiones exactas quedan registradas en el archivo conversion.json del repositorio.

La conversión se realizó con mlx-audio 0.6.1 y preserva la precisión del modelo fuente. No hay información disponible sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica destacable de esta ficha es la corrección del vocoder: el conversor aplica una pendiente de activación HiFT final de 0,1, mientras que el decodificador oficial en PyTorch usa 0,01, lo que provoca clipping y distorsión. El parche incluido (patch_chatterbox_vocoder.py) corrige esta discrepancia y, según el autor, consigue que el vocoder MLX parcheado coincida con la salida oficial de PyTorch con un error RMS de 1,1e-6 en la muestra de diagnóstico, sin muestras con amplitud igual o superior a 0,98 (frente al 14,0 % antes del parche).

## Capacidades

- Síntesis de voz (text-to-speech) en portugués brasileño a partir de texto.
- Clonación de voz mediante una grabación de referencia (`--ref_audio`).
- Generación de audio con el tokenizador de voz S3TokenizerV2 descargado automáticamente.
- Ejecución local en Apple Silicon mediante MLX y mlx-audio.
- Interfaz de línea de comandos mediante `mlx_audio.tts.generate`.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada más allá de la referencia de voz.
- Capacidad multilingüe limitada al portugués brasileño en esta conversión.

## Casos de uso

- Clonación de voz para doblaje de contenido en portugués brasileño: se proporciona una muestra de referencia del hablante y el modelo genera nuevas locuciones con esa voz, útil para localizar vídeos o pódcast sin regrabar.
- Generación de audiolibros y narración: el modelo sintetiza texto largo en pt-BR con una voz consistente definida por la referencia, adecuado para producción de contenido editorial.
- Asistentes de voz locales en macOS: al ejecutarse sobre MLX en Apple Silicon, permite integrar TTS en aplicaciones de escritorio sin enviar texto a servicios en la nube.
- Prototipado de interfaces conversacionales en portugués: desarrolladores que necesitan una voz sintética para probar flujos de atención al cliente o IVR en pt-BR pueden generar muestras rápidamente en local.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia en portugués brasileño, con voces personalizadas mediante clonación.
- Investigación en síntesis de voz: el repositorio documenta el proceso de conversión PyTorch a MLX y la corrección del vocoder, lo que lo convierte en una referencia útil para estudiar fidelidad numérica entre implementaciones.
- Generación de contenido para redes y marketing en pt-BR: producción de voces en off con una voz de marca clonada, con control local sobre los datos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es la comparación del vocoder parcheado frente a la salida oficial de PyTorch: error RMS de 1,1e-6 en la muestra de diagnóstico y ausencia de muestras con amplitud igual o superior a 0,98, frente al 14,0 % antes del parche.

## Requisitos de hardware

- Hardware objetivo: Mac con Apple Silicon (requisito explícito del autor); no se soporta CUDA de forma nativa en esta conversión.
- VRAM/memoria: no disponible de forma explícita; el repositorio ocupa 2,7 GB y los pesos están sin cuantizar, por lo que se necesita memoria unificada suficiente para cargar el modelo completo más el tokenizador S3TokenizerV2.
- GPU recomendadas: no disponible; el autor solo indica Apple Silicon.
- Compatibilidad con GPU de consumo: no aplica a GPU NVIDIA/AMD en esta conversión; en Apple Silicon depende del modelo concreto de chip y de su memoria unificada.
- Opciones de despliegue: mlx-audio (CLI `mlx_audio.tts.generate`) y OpenVox, para el que el autor indica que hay que aplicar el parche al archivo hifigan.py del runtime empaquetado y reconstruir la aplicación.
- Latencia y throughput: no disponible.
- Requisito operativo: aplicar patch_chatterbox_vocoder.py en el entorno de inferencia y reiniciar cualquier proceso que ya haya cargado el decodificador; los pesos no necesitan reconversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Chatterbox-Multilingual-pt-br-MLX (este) | 677.696.431 | no disponible | pt-BR | MIT | safetensors (MLX) | Conversion MLX para Apple Silicon; requiere parche de vocoder |
| ResembleAI/Chatterbox-Multilingual-pt-br | no disponible | no disponible | pt-BR | no disponible | no disponible | Modelo fuente en PyTorch; referencia oficial de calidad |
| ResembleAI/chatterbox | no disponible | no disponible | no disponible | no disponible | no disponible | Repositorio del que se toman voice encoder y mapeo Cangjie |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparación se limita a licencia, formato y plataforma de ejecución.

## Limitaciones y advertencias

- El modelo solo soporta portugués brasileño; no se documentan otros idiomas en esta conversión.
- Requiere una grabación de referencia de voz para la clonación; sin ella no se puede usar según las instrucciones del autor.
- Sin el parche del vocoder, la salida presenta clipping y distorsión severa (14,0 % de muestras con amplitud igual o superior a 0,98 en la prueba de diagnóstico).
- La evaluación amplia por escucha sigue pendiente según el propio autor; la validación se limita a una muestra de diagnóstico.
- Es una conversión de pesos, no un modelo entrenado; hereda los sesgos y limitaciones del modelo fuente ResembleAI/Chatterbox-Multilingual-pt-br, sobre los que no hay información disponible.
- Riesgo de alucinación y de artefactos en la voz generada: no se documentan métricas de inteligibilidad ni de naturalidad.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo fuente y de los componentes (voice encoder, tokenizador) por separado.
- Dependencia de versiones concretas de mlx-audio (0.6.1) y de aplicar el parche en el entorno correcto; parchear un venv distinto no afecta a una aplicación ya en ejecución.
- No hay soporte documentado para CUDA ni para GPUs de consumo NVIDIA en esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/theoracleguy/Chatterbox-Multilingual-pt-br-MLX
- Modelo base: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-pt-br
- Repositorio de componentes (voice encoder y mapeo Cangjie): https://huggingface.co/ResembleAI/chatterbox
- Tokenizador de voz: https://huggingface.co/mlx-community/S3TokenizerV2
