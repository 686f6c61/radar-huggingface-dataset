# younghan-meta/Muse-Glimmer-Voice-Agent-ExecuTorch

## Resumen

Este repositorio no contiene un modelo de lenguaje en el sentido habitual, sino un paquete de runtime nativo precompilado que da soporte a la receta de agente de voz para macOS de Muse Glimmer, publicada en el repositorio meta-oss-cookbook. El artefacto agrupa tres ejecutables para Apple silicon compilados a partir de un unico checkout fijado de ExecuTorch, junto con la biblioteca Metal de MLX que comparten: `parakeet_helper`, `muse_glimmer_worker`, `supertonic_runner` y `mlx.metallib`.

El problema que resuelve es el de la distribucion reproducible de los binarios de inferencia en el lado del cliente: en lugar de obligar a compilar ExecuTorch y MLX desde cero en cada maquina, el autor publica un bundle empaquetado en `runtime-macos-arm64-executorch-20ad5ee.tar.gz` con revisiones de dependencias fijadas. Los pesos en formato PTE no se duplican aqui de forma intencionada: la receta del cookbook los descarga desde los repositorios independientes de Muse Glimmer, Parakeet y Supertonic.

Es relevante ahora porque ilustra el patron de despliegue on-device de agentes de voz completos (reconocimiento de voz, generacion de texto y sintesis de voz) sobre Apple silicon, con etapas diferenciadas para cada tarea. El repositorio figura como artefacto de desarrollo pendiente de validacion en maquina limpia, con 0 descargas y 0 likes en el momento de la consulta, fecha de creacion y ultima actualizacion del 24 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene binarios de runtime, no pesos de un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (los ejecutables compilados con ExecuTorch se distribuyen bajo BSD-3-Clause; la biblioteca Metal de MLX bajo licencia MIT) |
| Formato de pesos | no incluidos en este repositorio; la receta descarga ficheros PTE desde los repositorios de Muse Glimmer, Parakeet y Supertonic |
| Plataforma | macOS arm64 |
| Version minima de macOS | 26.0 |
| Revision de ExecuTorch | `20ad5ee43ff53804030899d621590af3daadda53` |
| Revision de MLX | `7a1d4f5c12ac82f4b4d0a6e71538d89ca0605247` |
| Firma | ad-hoc, firmada por el enlazador; no notarizada con Developer ID |
| Biblioteca declarada | executorch |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red neuronal ni sobre proceso de entrenamiento, porque el repositorio no publica pesos ni documenta el entrenamiento de ningun modelo. Lo que se distribuye es una cadena de ejecucion: los ejecutables se compilan a partir de una revision concreta de ExecuTorch y comparten `mlx.metallib`, la biblioteca Metal de MLX empleada para acelerar la inferencia en GPU integrada de Apple silicon.

El bundle incluye tres binarios con responsabilidades separadas, lo que sugiere una arquitectura de pipeline de voz por etapas: `parakeet_helper` para la parte de reconocimiento de voz, `muse_glimmer_worker` para la generacion de texto y `supertonic_runner` para la sintesis de voz. No se detalla en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo tecnicas de alineacion como RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Ejecucion on-device de un pipeline de agente de voz completo sobre macOS en Apple silicon: reconocimiento de voz, generacion de texto y sintesis de voz.
- Reconocimiento de voz: la presencia del binario `parakeet_helper` apunta a la integracion de un modelo de la familia Parakeet para la etapa de speech-to-text.
- Generacion de texto: el binario `muse_glimmer_worker` cubre la etapa de generacion, coherente con la etiqueta `text-generation` y el pipeline declarado en el repositorio.
- Sintesis de voz: `supertonic_runner` corresponde a la etapa de text-to-speech.
- Aceleracion por GPU mediante MLX: la biblioteca `mlx.metallib` habilita computo Metal en chips de Apple.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): el unico ambito documentado es el audio y el texto del pipeline de voz.

## Casos de uso

- Asistentes de voz locales en macOS: el bundle permite ejecutar las tres etapas del agente de voz (STT, LLM y TTS) en la propia maquina, sin enviar audio a un servicio externo, lo que resulta adecuado para aplicaciones que manejan conversaciones sensibles.
- Integracion en aplicaciones de escritorio para Apple silicon: el artefacto se extrae directamente en un directorio de artefactos de la aplicacion (`bin/parakeet_helper`, `bin/muse_glimmer_worker`, `bin/supertonic_runner`, `bin/mlx.metallib`), de modo que un desarrollador puede empaquetarlo como parte del binario distribuible de su app.
- Reproduccion de entornos de desarrollo: al fijar las revisiones exactas de ExecuTorch y MLX, el bundle sirve para que varios miembros de un equipo trabajen con exactamente la misma cadena de inferencia y descarten discrepancias por versiones distintas.
- Pruebas de la receta de voz de Muse Glimmer: el bundle es el runtime que consume la receta `voice-agent-macos` del repositorio meta-oss-cookbook, por lo que su uso principal es la ejecucion de dicha receta.
- Verificacion de integridad en pipelines de distribucion: la recomendacion de descargar por revision inmutable de Hugging Face y comprobar los hashes del archivo y de los ficheros extraidos contra `manifest.json` encaja en flujos de CI que validan artefactos antes de publicarlos.
- Evaluacion de rendimiento de ExecuTorch frente a otras alternativas en Apple silicon: al incluir una revision concreta de ExecuTorch y de MLX, el paquete permite medir latencias y consumo del stack nativo en hardware Apple frente a otras rutas de despliegue.
- Base para prototipos de agentes conversacionales por voz en investigacion: un grupo puede partir de este runtime para experimentar con distintas combinaciones de modelos PTE de STT, generacion y TTS sin recompilar el stack nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de latencia, throughput ni metricas de calidad para las etapas de reconocimiento de voz, generacion de texto o sintesis de voz.

## Requisitos de hardware

- Plataforma obligatoria: macOS arm64 sobre Apple silicon. La tabla de compatibilidad del autor indica macOS 26.0 como version minima.
- VRAM estimada para inferencia: no disponible. Al no incluirse pesos ni documentarse tamanos de modelo, no es posible estimar el consumo de memoria unificada.
- GPU recomendadas: no disponible. El bundle esta orientado a chips de Apple silicon y aprovecha MLX a traves de Metal, pero no se enumeran modelos concretos de chip.
- Encaje en GPU de consumo: no disponible; la plataforma de destino no es x86 con GPU dedicada, sino equipos Apple silicon.
- Opciones de despliegue: extraccion del archivo `runtime-macos-arm64-executorch-20ad5ee.tar.gz` en el directorio de artefactos de la aplicacion, con ejecucion de los binarios `parakeet_helper`, `muse_glimmer_worker` y `supertonic_runner`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Firma y validacion: los binarios son ad-hoc y estan firmados por el enlazador, no notarizados con Developer ID, lo que puede requerir ajustes de politicas de seguridad en macOS para su ejecucion.
- Requisito de integridad: el autor indica descargar por revision inmutable de Hugging Face y verificar los hashes del archivo comprimido y de los ficheros extraidos contra `manifest.json`.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo con parametros y pesos comparables, sino un bundle de ejecutables de runtime, por lo que una comparacion por parametros, contexto o rendimiento con modelos alternativos no resulta aplicable. La comparacion pertinente seria frente a otros runtimes de inferencia on-device, pero la informacion proporcionada no incluye datos de ninguno de ellos.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo entrenado; no contiene pesos y no puede usarse por si solo para generar texto, transcribir audio ni sintetizar voz. Requiere descargar los ficheros PTE desde los repositorios de Muse Glimmer, Parakeet y Supertonic.
- Estado de desarrollo: el propio autor lo describe como artefacto de desarrollo pendiente de validacion en maquina limpia, lo que implica que no debe tratarse como una version estable de produccion.
- Firma no notarizada: los ejecutables son ad-hoc y firmados por el enlazador, sin notarizacion de Developer ID, lo que puede provocar bloqueos al abrirlos en macOS y complica su distribucion a terceros.
- Restricciones de plataforma: solo macOS arm64 con version minima 26.0; no hay soporte para Windows, Linux ni equipos con procesadores Intel.
- Licencia: la licencia declarada en Hugging Face es `other`. Los ejecutables compilados con ExecuTorch se distribuyen bajo BSD-3-Clause y la biblioteca Metal de MLX bajo MIT, segun los textos incluidos en `LICENSES/`, pero la licencia del conjunto y la de los pesos descargados por separado deben verificarse antes de un uso comercial.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible para el modelo subyacente, ya que no se documenta su entrenamiento ni su comportamiento.
- Limitaciones de contexto e idioma: no disponible; el repositorio no declara ventana de contexto ni idiomas soportados.
- Reproducibilidad: el bundle fija revisiones concretas de ExecuTorch y MLX, de modo que actualizar cualquiera de las dos dependencias invalida la correspondencia con este artefacto.
- Ausencia de traccion: 0 descargas y 0 likes en el momento de la consulta, junto con un tamano de repositorio de 0,0 GB en los metadatos, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/younghan-meta/Muse-Glimmer-Voice-Agent-ExecuTorch
- Receta de agente de voz para macOS en el cookbook de Meta: https://github.com/meta-models/meta-oss-cookbook/tree/main/recipes/voice-agent-macos
- Revision de ExecuTorch fijada: `20ad5ee43ff53804030899d621590af3daadda53`
- Revision de MLX fijada: `7a1d4f5c12ac82f4b4d0a6e71538d89ca0605247`
- Repositorios de pesos PTE (Muse Glimmer, Parakeet y Supertonic): referenciados en la model card, sin URL concreta disponible en la informacion proporcionada.
