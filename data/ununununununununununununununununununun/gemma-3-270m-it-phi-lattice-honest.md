# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-honest

## Resumen

`gemma-3-270m-it-phi-lattice-honest` es una compilacion derivada experimental del modelo Gemma 3 de 270 millones de parametros en su variante instruction-tuned, publicada por el usuario `ununununununununununununununununununun` en Hugging Face. Se construye sobre el checkpoint `gemma-3-270m-it-phi-lattice`, que aplica una cuantizacion no uniforme de 4 bits denominada `phi-lattice` junto con una pasada de poda de ruido de baja magnitud sobre todas las proyecciones lineales.

La modificacion especifica de esta variante consiste en una recalibracion quirurgica de las proyecciones MLP de salida de las capas superiores (capas 14 a 17) para que el modelo emita una abstencion explicita ("I do not know") cuando no dispone de soporte asociativo interno ante consultas factuales no verificables. Las capas inferiores y medias (0 a 13) permanecen congeladas para preservar el recuerdo factual y el razonamiento creativo o hipotetico.

El modelo es relevante como experimento de investigacion sobre calibracion de abstención en modelos pequenos: propone inducir el comportamiento de "no lo se" directamente en los pesos, sin necesidad de hooks en tiempo de ejecucion ni scripts externos. Se distribuye en formato GGUF (q8_0) y safetensors (float16), con licencia Gemma, y esta pensado para pruebas y comparacion frente al checkpoint base `phi-lattice`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF q8_0 (build incluido); cuantizacion base `phi-lattice` de 4 bits no uniforme en el checkpoint de origen; pesos safetensors en float16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma |
| Formato de pesos | GGUF (`gemma-3-270m-it-optimized-q8_0.gguf`, 279 MB) y safetensors (float16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante de texto (`gemma3_text`), un transformer decoder-only de 270 millones de parametros. Sobre ese checkpoint se aplica la transformacion `phi-lattice`: una cuantizacion no uniforme de 4 bits combinada con una pasada de poda de ruido de baja magnitud en todas las proyecciones lineales. Posteriormente, esta variante "honest" congela las capas 0 a 13 y recalibra las proyecciones MLP de salida de las capas 14 a 17, recristalizandolas sobre la retícula `phi-lattice` para inducir abstención ante consultas factuales sin soporte asociativo interno.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica declarada es la calibracion de abstención integrada en pesos, que evita depender de hooks de inferencia o scripts externos para que el modelo responda "I do not know" cuando no puede fundamentar una respuesta.

## Capacidades

- Generacion de texto conversacional en formato instruction-tuned (pipeline `text-generation`).
- Abstencion calibrada: emite "I do not know" ante consultas factuales no verificables sin soporte asociativo interno.
- Razonamiento hipotetico y creativo preservado por el congelado de las capas 0 a 13.
- Recuerdo factual basico a traves de las capas inferiores y medias no modificadas.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue via Ollama, llama.cpp y LM Studio mediante el GGUF incluido.
- Plantilla de chat y configuracion de stop-tokens incluidas (`Modelfile`, `template`, `params`).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto (`gemma3_text`).
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre calibracion de abstención: sirve como banco de pruebas para estudiar si la induccion de "no lo se" en pesos reduce la fabricacion de datos sin degradar el recuerdo factual, comparandolo directamente con el checkpoint base `phi-lattice`.
- Despliegue en dispositivos de recursos limitados: con 270 millones de parametros y un GGUF q8_0 de 279 MB, puede ejecutarse en CPU o GPUs de gama baja para prototipos de chat locales.
- Asistentes de FAQ con politica de abstención: en dominios donde es preferible admitir desconocimiento antes que inventar, la calibracion de las capas superiores reduce respuestas no fundamentadas.
- Evaluacion de pipelines de cuantizacion: permite comparar el efecto de la cuantizacion `phi-lattice` de 4 bits frente a pesos float16 en tareas de recuerdo y abstención.
- Pruebas de integracion con Ollama: el `Modelfile` y la plantilla incluidos permiten levantar el modelo con `ollama create` para validar flujos de chat y stop-tokens en entornos de desarrollo.
- Docencia y experimentacion con modelos pequenos: su tamano facilita ejecutar experimentos de ajuste y evaluacion en un solo equipo sin infraestructura dedicada.
- Comparacion de estrategias de alineacion: util para medir el coste en utilidad de forzar abstención en modelos de menos de 300 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB con el GGUF q8_0 (279 MB) y en torno a 0,5-0,6 GB con pesos float16 (268 millones de parametros).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas de VRAM. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, e incluso en CPU pura.
- Opciones de despliegue: Ollama (via `ollama run hf.co/...` o `ollama create` con el Modelfile incluido), llama.cpp, LM Studio y Hugging Face Transformers con los safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-3-270m-it-phi-lattice-honest (este) | 268.098.176 | No disponible | GGUF q8_0, safetensors fp16 | Gemma | Variante experimental con abstención calibrada en capas 14-17 |
| gemma-3-270m-it-phi-lattice (base) | No disponible en la informacion | No disponible | No disponible | Gemma | Checkpoint de origen con cuantizacion `phi-lattice` de 4 bits y poda de ruido, sin calibracion de abstención |
| Gemma 3 270M IT (original de Google) | No disponible en la informacion | No disponible | No disponible | Gemma | Modelo base instruction-tuned de la familia Gemma 3; referencia de comportamiento sin las modificaciones `phi-lattice` |

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe como "experimental derivative build" destinado a pruebas y comparacion, no a produccion.
- Con solo 268 millones de parametros, la capacidad de razonamiento y el conocimiento factual son limitados en comparacion con modelos de mayor tamano.
- La calibracion de abstención puede producir falsos negativos: el modelo podria responder "I do not know" ante consultas que si podria responder correctamente, degradando la utilidad.
- La cuantizacion `phi-lattice` de 4 bits y la poda de ruido pueden introducir perdida de precision frente a los pesos originales en float16.
- No hay informacion publicada sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion: mitigado parcialmente en las capas superiores, pero no eliminado; las capas 0 a 13 conservan el comportamiento original.
- La licencia Gemma impone terminos de uso especificos que deben revisarse antes de cualquier uso comercial.
- No se dispone de informacion sobre idiomas soportados ni sobre la longitud de contexto efectiva.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria del comportamiento declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-honest
- Checkpoint base: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
