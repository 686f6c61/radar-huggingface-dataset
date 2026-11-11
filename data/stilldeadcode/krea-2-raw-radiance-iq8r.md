# StillDeadcode/krea-2-raw-radiance-iq8r

## Resumen

krea-2-raw-radiance-iq8r es una cuantización de tipo W8A8 del modelo de generación de imágenes Krea-2-Raw, publicada por el usuario StillDeadcode. El modelo base, desarrollado por Krea, es un text-to-image que se distribuye en formato cuantizado para su uso con la librería Radiance, orientada a acelerar la inferencia en GPUs AMD con arquitectura RDNA4 mediante instrucciones INT8 y transformadas de Hadamard.

El interés de esta ficha radica en que documenta una variante de despliegue específica para hardware AMD, un nicho poco cubierto en el ecosistema de difusión, donde la mayoría de cuantizaciones se centran en GPUs NVIDIA. El repositorio ocupa 17,6 GB y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La información pública disponible es muy limitada: no se detallan parámetros, contexto, composición del dataset ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables del repositorio y del modelo base, e indica explícitamente "no disponible" en todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusión text-to-image; la cuantización emplea Radiance con W8A8, INT8 e IQ8R con transformada de Hadamard) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 INT8 (IQ8R) sobre el modelo base |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (license:other) |
| Formato de pesos | Radiance (librería radiance); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Krea-2-Raw es un generador de imágenes text-to-image de Krea. No se ha publicado en la información disponible la arquitectura interna (tipo de backbone, número de parámetros, mecanismo de atención ni variante de difusión). Esta variante concreta no reentrena el modelo: aplica una cuantización de pesos y activaciones a 8 bits (W8A8) con esquema IQ8R y transformada de Hadamard, empaquetada para la librería Radiance y optimizada para GPUs AMD RDNA4 con soporte ROCm.

La innovación técnica principal es el soporte nativo de INT8 en hardware AMD RDNA4, que permite reducir el uso de memoria y aumentar el throughput frente a la inferencia en precisión completa. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Inferencia cuantizada en INT8 (W8A8) con la librería Radiance.
- Ejecución en GPUs AMD con arquitectura RDNA4 mediante ROCm.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU AMD RDNA4: el modelo permite ejecutar text-to-image en hardware AMD aprovechando las instrucciones INT8, un escenario donde escasean las alternativas cuantizadas.
- Prototipado rápido de assets visuales: al ocupar 17,6 GB el repositorio, puede desplegarse en una máquina con VRAM suficiente para iterar sobre prompts y estilos sin depender de servicios en la nube.
- Integración en pipelines de diseño gráfico: la cuantización W8A8 reduce el coste de memoria y permite mantener el modelo cargado en memoria para generar variaciones de forma continua.
- Investigación sobre cuantización en difusión: sirve como referencia para estudiar el impacto de IQ8R y la transformada de Hadamard en la calidad de imagen frente al modelo base en precisión completa.
- Evaluación de la librería Radiance: útil para desarrolladores que quieran medir el rendimiento de Radiance en ROCm antes de adoptarla en producción.
- Despliegue en entornos con licencia comunitaria: adecuado para proyectos que puedan cumplir los términos de la krea-2-community-license y que necesiten inferencia local en AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 17,6 GB, por lo que se requiere una GPU con al menos esa cantidad de memoria para cargar los pesos cuantizados, más el overhead de activaciones y buffers.
- GPU recomendadas: GPUs AMD con arquitectura RDNA4 (familia RX 9000) y soporte ROCm; el tag "rocm" y "rdna4" del repositorio confirman esta orientación.
- Compatibilidad con GPU de consumo: previsiblemente sí en modelos RDNA4 de gama alta con VRAM suficiente, aunque no se especifica el mínimo exacto.
- Opciones de despliegue: librería Radiance sobre ROCm; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krea-2-raw-radiance-iq8r | no disponible | no disponible | no disponible | krea-2-community-license | gated, Hugging Face |
| krea/Krea-2-Raw (base) | no disponible | no disponible | no disponible | krea-2-community-license | Hugging Face |
| Otras cuantizaciones de Krea-2-Raw | no disponible | no disponible | no disponible | según variante | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar las condiciones en Hugging Face antes de la descarga.
- Licencia krea-2-community-license: es una licencia comunitaria con posibles restricciones para uso comercial; debe revisarse antes de desplegar en producción.
- La cuantización INT8 puede introducir degradación en la calidad de imagen respecto al modelo base en precisión completa; no se han publicado evaluaciones al respecto.
- Compatibilidad limitada a hardware AMD RDNA4 con ROCm; no se garantiza su funcionamiento en GPUs NVIDIA u otras arquitecturas.
- Dependencia de la librería Radiance, menos extendida que otros runners de difusión, lo que puede complicar el soporte y la integración.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base; no se documentan mitigaciones.
- Sin información sobre idiomas soportados ni sobre el comportamiento con prompts en castellano.
- Sin datos de benchmarks que permitan estimar la fidelidad prompt-imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/StillDeadcode/krea-2-raw-radiance-iq8r
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia comunitaria: no disponible como enlace directo en la información proporcionada
