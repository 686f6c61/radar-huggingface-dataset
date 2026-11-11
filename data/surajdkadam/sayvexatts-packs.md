# surajdkadam/sayvexatts-packs

## Resumen

SayvexaTTS voice packs es un repositorio de pesos empaquetados para la aplicación de escritorio SayvexaTTS, orientada a síntesis de voz (text-to-speech) totalmente offline en idiomas índicos, principalmente maratí e hindi. No se trata de un modelo único entrenado por el autor, sino de una colección de cuatro packs que agrupan modelos de terceros: AI4Bharat Indic Parler-TTS para TTS, AI4Bharat IndicF5 junto con el vocoder Vocos para clonación de voz, Whisper large-v3-turbo convertido a CTranslate2 para transcripción y AI4Bharat IndicTrans2 destilado de 200M para traducción en→indic e indic→en.

El repositorio, publicado por el usuario surajdkadam, tiene un tamaño de 5,9 GB y se distribuye bajo licencia "other", aunque cada pack conserva la licencia de su modelo de origen (Apache-2.0 para Indic Parler-TTS, MIT para IndicF5, Vocos, Whisper e IndicTrans2). La relevancia actual radica en que facilita el despliegue de un pipeline de voz completo sin conexión para lenguas con poca cobertura comercial, empaquetando pesos en fp16 y verificándolos mediante sumas SHA-256 integradas en la aplicación.

No se dispone de información sobre arquitecturas internas específicas más allá de las de los modelos originales que contiene, ni de resultados de benchmarks propios del repositorio. La ficha se limita, por tanto, a describir el contenido declarado en la model card y las características conocidas de los modelos empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (contenedor de pesos de modelos de terceros: Indic Parler-TTS, IndicF5 + Vocos, Whisper large-v3-turbo en CTranslate2, IndicTrans2 destilado 200M) |
| Parametros totales | No disponible (varía por pack; IndicTrans2 destilado: 200M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos almacenados en fp16 en los packs ultra-indic y translate; conversión CTranslate2 en el pack transcribe; no se detallan otras cuantizaciones |
| Idiomas soportados | Maratí e hindi (según tags); el pack translate cubre en→indic e indic→en |
| Licencia | other (repositorio); packs individuales: Apache-2.0 (Indic Parler-TTS), MIT (IndicF5, Vocos, Whisper, IndicTrans2) |
| Formato de pesos | safetensors (tag del repo); CTranslate2 en el pack transcribe |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: es un contenedor de distribución de pesos para la aplicación SayvexaTTS. Cada pack agrupa un modelo de terceros con su model card original (README.md) preservada. El pack `ultra-indic/` contiene AI4Bharat Indic Parler-TTS en fp16; el pack `voice-clone/` incluye AI4Bharat IndicF5 junto con la configuración del vocoder Vocos; el pack `transcribe/` incorpora Whisper large-v3-turbo convertido a CTranslate2; y el pack `translate/` contiene AI4Bharat IndicTrans2 destilado de 200M en fp16 para traducción bidireccional inglés↔índico.

No se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO en los modelos subyacentes. La innovación técnica del repositorio es operativa: empaquetado offline con verificación de integridad mediante sumas SHA-256 integradas en la aplicación y descarga desde la propia interfaz (Voice Packs → Download).

## Capacidades

- Síntesis de voz (text-to-speech) offline en maratí e hindi mediante Indic Parler-TTS.
- Clonación de voz con IndicF5 y el vocoder Vocos.
- Transcripción de audio con Whisper large-v3-turbo (conversión CTranslate2 para inferencia eficiente).
- Traducción automática en→indic e indic→en con IndicTrans2 destilado de 200M.
- Funcionamiento completamente offline una vez descargados los packs.
- Verificación de integridad de los pesos mediante SHA-256 integrado en la aplicación.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Síntesis de voz para aplicaciones de accesibilidad en maratí e hindi: el pack `ultra-indic` permite generar locuciones sin conexión para lectores de pantalla o asistentes locales, útil en entornos sin red o con requisitos de privacidad.
- Clonación de voz para doblaje y locución personalizada: el pack `voice-clone` con IndicF5 y Vocos permite generar voces a partir de muestras de referencia en lenguas índicas, adecuado para producción de contenido localizado.
- Transcripción de reuniones y notas de voz: el pack `transcribe` con Whisper large-v3-turbo en CTranslate2 permite convertir audio a texto en local, sin enviar datos a servicios en la nube.
- Traducción de documentación técnica entre inglés e idiomas índicos: el pack `translate` con IndicTrans2 destilado de 200M sirve para pipelines de traducción ligeros en local, con un modelo de 200M parámetros que reduce requisitos de cómputo.
- Integración en la aplicación de escritorio SayvexaTTS: los packs se instalan desde la propia interfaz y se verifican con SHA-256, lo que simplifica el despliegue en estaciones de trabajo de usuarios finales.
- Escenarios con requisitos de soberanía del dato: al ser todo offline, encaja en administraciones o entornos sanitarios que no pueden enviar audio a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; depende del pack cargado y del backend de inferencia.
- GPU recomendadas: no disponibles; el repo no especifica requisitos por modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño total del repo (5,9 GB) sugiere que los packs pueden caber en GPUs de consumo, pero no se detalla.
- Opciones de despliegue: la aplicación de escritorio SayvexaTTS; el pack `transcribe` usa CTranslate2, lo que permite inferencia optimizada en CPU y GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SayvexaTTS voice packs | Varía por pack (IndicTrans2: 200M) | No disponible | No disponible | other (packs: Apache-2.0/MIT) | Hugging Face, 0 descargas |
| AI4Bharat Indic Parler-TTS | No disponible | No disponible | No disponible | Apache-2.0 | Incluido en el pack ultra-indic |
| AI4Bharat IndicF5 + Vocos | No disponible | No disponible | No disponible | MIT | Incluido en el pack voice-clone |
| Whisper large-v3-turbo (CTranslate2) | No disponible | No disponible | No disponible | MIT | Incluido en el pack transcribe |

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor: es un contenedor de pesos de terceros, por lo que su calidad depende de los modelos originales.
- La licencia del repositorio es "other"; el uso comercial requiere revisar las licencias individuales de cada pack (Apache-2.0 y MIT en los casos indicados).
- No se especifican sesgos conocidos ni tasas de alucinación para los modelos empaquetados en la información disponible.
- Cobertura idiomática limitada a maratí, hindi y traducción inglés↔índico; no se declaran otros idiomas.
- No se detallan limitaciones de contexto ni requisitos de hardware, lo que dificulta la planificación de producción.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por la comunidad.
- La fecha de creación (2026-11-09) es posterior a la fecha actual, lo que puede indicar un error de metadatos o una publicación programada; conviene verificarlo antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/surajdkadam/sayvexatts-packs
- AI4Bharat Indic Parler-TTS (modelo empaquetado): no disponible en la búsqueda
- AI4Bharat IndicF5 (modelo empaquetado): no disponible en la búsqueda
- Vocos (charactr): no disponible en la búsqueda
- OpenAI Whisper large-v3-turbo: no disponible en la búsqueda
- AI4Bharat IndicTrans2: no disponible en la búsqueda
