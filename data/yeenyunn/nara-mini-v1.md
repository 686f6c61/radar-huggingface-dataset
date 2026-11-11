# YeeNyunn/nara-mini-v1

## Resumen

Nara Mini v1 es un modelo de síntesis de voz (text-to-speech) desarrollado por YeeNyunn, construido sobre la arquitectura Kokoro y adaptado para birmano (`my`) e inglés (`en`). El modelo ofrece cuatro voces predefinidas (`shoon`, `thazin`, `ko-banyar`, `htet-myat`) y está pensado para inferencia local, con exportaciones en safetensors de precisión completa y ONNX optimizado para dispositivos móviles. Su relevancia radica en cubrir una laguna notable: el soporte TTS de calidad para birmano es escaso en el ecosistema open source, y este modelo lo aborda con reglas de pronunciación específicas, léxico de excepciones y normalización numérica propia del idioma.

El repositorio ocupa 2,8 GB e incluye tanto los tensores originales de inferencia como paquetes `.nara` listos para instalar en la aplicación Nara. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto. No se han publicado resultados de benchmarks objetivos en la documentación disponible.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, lo que sugiere un lanzamiento muy reciente o de baja difusión. La información técnica disponible proviene exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (encoder BERT + predictor + text encoder + decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa pasajes largos en fragmentos) |
| Tipos de cuantizacion | FP completo (safetensors) e INT8 selectivo en decoder (ONNX) |
| Idiomas soportados | birmano (`my`), inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, paquetes `.nara` |

## Arquitectura y entrenamiento

Nara Mini v1 se basa en Kokoro, un modelo TTS de arquitectura ligera que combina un encoder de estilo BERT (`bert`, `bert_encoder`), un predictor de duración/prosodia (`predictor`), un encoder de texto (`text_encoder`) y un decoder de audio (`decoder`). La salida es audio mono a 24 kHz. Cada una de las cuatro voces dispone de su propia red y su propio voicepack, con vectores de estilo y vocabulario asociados en `voice.json`, junto con los centros de bins de longitud.

El autor indica que las cuatro voces se desarrollaron usando habla sintética generada con VoxCPM2, y que la versión exacta del checkpoint inicial de Kokoro no quedó registrada en la documentación de la release. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El procesamiento de texto incorpora reglas de pronunciación birmana, un léxico de excepciones, fonemización inglesa mediante Misaki (con dependencia de eSpeak) y normalización de números birmanos a palabras habladas antes de la fonemización.

La exportación móvil en ONNX emplea un encoder en precisión completa y un decoder cuantizado selectivamente a INT8, lo que reduce el coste computacional en dispositivos con recursos limitados.

## Capacidades

- Síntesis de voz en birmano e inglés con cuatro voces predefinidas.
- Salida de audio mono a 24 kHz.
- Normalización de números en birmano, incluidos textos mixtos birmano-inglés.
- Fonemización inglesa mediante Misaki y eSpeak.
- Inferencia local en CPU mediante ONNX.
- Procesamiento de pasajes largos mediante fragmentación automática.
- Control del número de hilos de CPU en inferencia (`--threads`).
- Opción de desactivar la normalización numérica (`--no-normalize-numbers`).
- Empaquetado para instalación en la app Nara mediante ficheros `.nara` con checksums.

## Casos de uso

- **Lectura de contenido en birmano**: el modelo convierte artículos, noticias o documentación a audio con pronunciación ajustada mediante reglas y léxico propios, algo poco habitual en herramientas TTS comerciales.
- **Accesibilidad para hablantes de birmano**: integración en lectores de pantalla o aplicaciones de accesibilidad que requieran síntesis local sin conexión, aprovechando la exportación ONNX en CPU.
- **Asistentes de voz bilingües birmano-inglés**: la normalización numérica y la fonemización inglesa permiten manejar respuestas mixtas en un mismo turno de conversación.
- **Aplicaciones móviles offline**: los paquetes `.nara` y el decoder INT8 están diseñados para instalarse en la app Nara y ejecutarse en dispositivo, útil en entornos con conectividad limitada.
- **Generación de audiolibros o pódcast**: el procesamiento por fragmentos permite narrar textos largos con las cuatro voces disponibles para distintos personajes o secciones.
- **Prototipado de interfaces conversacionales**: al ser Apache 2.0 y ejecutable en CPU, sirve para validar flujos de voz en producto antes de invertir en infraestructura GPU.
- **Localización de contenido**: conversión de material formativo o institucional al birmano hablado sin depender de servicios cloud de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para inferencia en CPU mediante ONNX.
- GPU recomendadas: no disponible; no se documenta requisito de GPU.
- Compatibilidad con GPU de consumo: no se especifica, pero el enfoque principal es CPU y dispositivos móviles.
- Despliegue: script `synthesize.py` con ONNX Runtime en CPU, con parámetro `--threads` para ajustar hilos. También paquetes `.nara` para la app Nara.
- Latencia y throughput: no disponibles; el autor indica que dependen del hardware, el formato de exportación y la longitud del pasaje.
- Tamaño del repositorio: 2,8 GB (incluye pesos completos, exportaciones ONNX y paquetes).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| Nara Mini v1 | no disponible | my, en | safetensors, ONNX, `.nara` | Apache 2.0 | Basado en Kokoro, 4 voces, enfoque móvil |
| Kokoro-82M (hexgrad) | 82M | múltiples (incl. en) | safetensors, ONNX | Apache 2.0 | Modelo base; no soporta birmano de forma nativa |
| VoxCPM2 (openbmb) | no disponible | no disponible | no disponible | no disponible | Usado solo para generar habla sintética de las voces |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La pronunciación y la prosodia pueden variar según el texto y la mezcla de idiomas.
- La normalización numérica sigue reglas de lectura birmana incluso en textos mixtos, lo que puede producir lecturas inesperadas de cifras en contextos ingleses.
- Los pasajes largos se procesan en fragmentos, lo que puede introducir discontinuidades en la prosodia entre segmentos.
- No se documenta el checkpoint exacto de Kokoro utilizado, lo que dificulta la reproducibilidad.
- El rendimiento depende del hardware, el formato de exportación y la longitud del texto; no hay métricas publicadas.
- Las dependencias de fonemización inglesa (Misaki, eSpeak) mantienen sus propias licencias, que deben revisarse por separado.
- No hay información sobre sesgos, tasas de alucinación o evaluación de calidad subjetiva (MOS).
- El modelo tiene cero descargas y cero likes, sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/YeeNyunn/nara-mini-v1
- Web de Nara Audio: https://naraaudio.app
- Kokoro (modelo base): https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2 (generación de habla sintética para las voces): https://huggingface.co/openbmb/VoxCPM2
