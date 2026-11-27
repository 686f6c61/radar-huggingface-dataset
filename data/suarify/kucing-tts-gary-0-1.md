# Suarify/kucing-tts-gary-0.1

## Resumen

Kucing TTS — Gary es un modelo de síntesis de voz (text-to-speech) en malayo desarrollado por Suarify, publicado bajo licencia Apache 2.0. Se distribuye como un artefacto ONNX cuantizado que se carga mediante la librería `kucing`, y su propósito es generar audio a partir de texto en malayo con una voz concreta denominada Gary, descrita por el autor como andrógina y construida sobre el decodificador entrenado para la voz Otis, pero con la frecuencia fundamental (F0) más alta del lado del texto.

El modelo se posiciona explícitamente como un producto independiente de Suarify y no como parte oficial de Kitten TTS. Según la model card, del proyecto Kitten TTS solo se reutilizó audio de referencia sintetizado a partir de su vector de voz pico-en Otis (licencia Apache 2.0); no se incluyen pesos, código ni vectores de voz de Kitten. Es relevante para desarrolladores que necesitan TTS ligero en malayo y que quieran ejecutar la inferencia en local a través de ONNX Runtime, aunque la información publicada sobre arquitectura, entrenamiento y rendimiento es muy escasa.

La ficha se basa únicamente en los metadatos de Hugging Face y en la model card disponible. No hay información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en decodificador, según la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`); no se detallan otros formatos |
| Idiomas soportados | Malayo (`ms`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelo cuantizado) |

## Arquitectura y entrenamiento

La model card describe Gary como una voz malaya andrógina que utiliza el decodificador entrenado para la voz Otis junto con la F0 natural más alta del lado del texto. No se especifica la arquitectura interna (tipo de encoder/decoder, vocoder, mecanismo de atención ni tamaño de la red), ni el número de tokens o horas de audio empleados en el entrenamiento, ni si hubo etapas de ajuste fino, RLHF o DPO. Tampoco se documenta la composición del dataset.

El único detalle técnico relevante es la procedencia de la referencia de voz: se sintetizó audio de referencia a partir del vector de voz pico-en Otis de Kitten TTS (Apache 2.0). El autor afirma que no se incluyen pesos, código ni vectores de voz de Kitten. El modelo se distribuye como un único archivo ONNX cuantizado, lo que sugiere un enfoque de inferencia ligera orientada a despliegue local o en navegador.

## Capacidades

- Síntesis de voz a partir de texto en malayo (`ms`).
- Generación de una voz concreta y fija (Gary), descrita como andrógina.
- Inferencia mediante ONNX Runtime a través de la librería `kucing`.
- Uso potencial en entornos locales o de navegador gracias al formato ONNX cuantizado.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura de textos en malayo en aplicaciones locales: el modelo puede integrarse mediante la librería `kucing` para convertir cadenas de texto en audio sin depender de servicios en la nube, gracias a su empaquetado ONNX.
- Prototipos de asistentes de voz en malayo: sirve para validar flujos de conversación y locuciones en etapas tempranas de desarrollo, aunque no se documentan métricas de calidad.
- Demos web de TTS: el autor publica un Space de demostración en navegador, lo que indica que el modelo puede ejecutarse en un entorno web con ONNX.
- Generación de avisos o locuciones pregrabadas en malayo: útil para producir audio de forma automatizada en catálogos, mensajes o contenido editorial, siempre que la calidad de la voz fija sea aceptable.
- Pruebas de accesibilidad: conversión de texto a voz para lectores de pantalla o contenidos educativos en malayo, con la limitación de que solo hay una voz disponible.
- Investigación en TTS de bajos recursos: el modelo puede servir como referencia para experimentos con voces malayas y despliegue ONNX, aunque la falta de documentación limita su reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se indica el tamaño del modelo ni el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX cuantizado sugiere que podría ejecutarse en CPU o en GPU modestas, pero no hay datos que lo verifiquen.
- Opciones de despliegue: ONNX Runtime mediante la librería `kucing`; el autor ofrece una demo en navegador (Space de Hugging Face).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Suarify/kucing-tts-gary-0.1 | Malayo (ms) | ONNX cuantizado | Apache 2.0 | No disponible | No disponible | Hugging Face |
| Kitten TTS (pico-en Otis) | Inglés (referencia citada) | No disponible | Apache 2.0 | No disponible | No disponible | No disponible en la información |
| Otros modelos TTS en malayo | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información publicada es muy escasa: no hay datos de arquitectura, parámetros, entrenamiento ni benchmarks, lo que dificulta evaluar su calidad y reproducibilidad.
- Solo soporta malayo (`ms`); no se documentan otros idiomas.
- Ofrece una única voz fija (Gary), sin control de emociones, velocidad ni clonación.
- No se documentan sesgos, pero al ser un modelo de voz entrenado con datos no especificados, pueden aparecer sesgos de pronunciación o prosodia no descritos.
- Riesgo de alucinación o artefactos de audio no evaluado por falta de métricas.
- Aunque la licencia es Apache 2.0, el autor aclara que no está afiliado ni respaldado por Kitten TTS; conviene revisar la procedencia de los datos de referencia antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican requisitos de hardware ni latencias, por lo que el despliegue en producción requeriría pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/Suarify/kucing-tts-gary-0.1
- Demo en navegador: https://huggingface.co/spaces/Suarify/kucing-tts-web
