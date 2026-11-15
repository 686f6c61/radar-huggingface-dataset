# Xylolabs/Z-Image-Turbo-Tenstorrent-Tensix-Components

## Resumen

Z-Image-Turbo-Tenstorrent-Tensix-Components es un export de componentes de pesos derivado del modelo de difusion Z-Image Turbo, desarrollado originalmente por el equipo Z-Image (Tongyi-MAI, Alibaba). Este repositorio, publicado por Xylolabs, no contiene un modelo ejecutable de extremo a extremo, sino un subconjunto de 452 operadores del denoiser preservados como tensores BF16 portables, pensados para su integracion en el hardware Tensix de Tenstorrent. El modelo base es un diffusion transformer de un solo flujo (single-stream DiT) orientado a la generacion eficiente de imagenes.

El interes de esta publicacion es de nicho: sirve como material de referencia para ingenieros que portan el denoiser de Z-Image Turbo a aceleradores Tensix. Se omiten deliberadamente el text encoder y el VAE, y se requiere un adaptador de arquitectura y el resto del pipeline para generar imagenes. El archivo pesa 12,3 GB y los pesos ocupan unos 12,34 GB en dispositivo antes de contar con buffers de trabajo.

No es un modelo para uso directo en inferencia estandar con PyTorch, vLLM o llama.cpp, sino un artefacto de componentes que documenta transformaciones concretas (concatenacion de operandos Q/K/V, transposicion de pesos lineales, reshapes de escalas de normalizacion) sobre los pesos primarios fijados en el commit `f332072`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer de un solo flujo (single-stream DiT), export de componentes del denoiser |
| Parametros totales | no disponible (el export contiene 452 operadores; no se declara el recuento total de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (todos los tensores del export son BF16; no se realiza cuantizacion en la publicacion) |
| Idiomas soportados | en, zh (declarados en los metadatos del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (452 archivos, BF16), mas `component.json` y `load_components.py` |

## Arquitectura y entrenamiento

El modelo base Z-Image Turbo es un diffusion transformer de un solo flujo descrito en el informe tecnico arXiv:2511.22699. Este repositorio no entrena ni afina nada: extrae 452 operadores de treinta capas principales, dos refinadores de contexto, dos refinadores de ruido, proyecciones de entrada de caption e imagen, proyecciones de timestep y una ruta de proyeccion final seleccionada. Los tensores se derivan de 520 tensores primarios en F32, redondeados a BF16, y se aplican transformaciones declaradas (concatenacion de operandos Q/K/V, transposicion de pesos lineales, reshapes de escalas y sesgos de normalizacion). No se realiza calibracion, cuantizacion ni entrenamiento adicional.

La innovacion tecnica de este export es la portabilidad y verificabilidad: `component.json` registra nombres, formas, dtypes, checksums y transformaciones de origen publico, y el loader `load_components.py` verifica SHA256, nombres, formas, dtype y valores finitos. La evaluacion publicada confirma que los 452 tensores son finitos y bit-exactos respecto a los valores BF16 guardados y a las transformaciones declaradas de los pesos primarios fijados. Se trata de comprobaciones en CPU; no se reporta evaluacion de tarea ni velocidad de generacion.

## Capacidades

- No es un modelo autonomo: no genera imagenes por si mismo sin un adaptador de arquitectura y el resto del pipeline (text encoder, VAE, scheduler).
- Proporciona los pesos del denoiser necesarios para reconstruir el nucleo de difusion de Z-Image Turbo en hardware Tensix.
- Incluye proyecciones de entrada de texto (caption) e imagen, y proyecciones de timestep.
- Incluye dos refinadores de contexto y dos refinadores de ruido.
- Carga selectiva por componente mediante el loader de streaming (permite descargar solo los archivos necesarios).
- Verificacion de integridad criptografica (SHA256) y de layout de tensores.
- Idiomas declarados del modelo base: ingles y chino.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Portabilidad a aceleradores Tenstorrent: uso principal del repositorio; los componentes sirven como entrada para implementar el denoiser de Z-Image Turbo en hardware Tensix con layouts ya transformados (Q/K/V concatenados, lineales transpuestos).
- Validacion de integridad en pipelines de portado: el loader verifica checksums y formas, lo que permite detectar corrupciones o desalineaciones antes de ejecutar en dispositivo.
- Referencia de transformaciones: `component.json` documenta cada transformacion sobre los pesos publicos, util para auditar una implementacion propia frente al modelo original.
- Investigacion en difusion eficiente: permite estudiar la estructura del single-stream DiT de Z-Image sin descargar el pipeline completo, cargando solo los componentes de interes.
- Desarrollo de adaptadores de arquitectura: los componentes aislados facilitan escribir y probar capas adaptadoras que conecten los pesos con un runtime Tensix.
- Carga parcial en entornos con memoria limitada: el loader de streaming permite descargar y cargar subconjuntos (por ejemplo, solo `x_emb`) para pruebas incrementales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones de integridad (tensores finitos, bit-exactitud respecto a los pesos primarios BF16, roundtrips de safetensors, verificacion de hashes) y declara explicitamente que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 12,34 GB solo para los pesos de los componentes, mas espacio para buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix (el export esta disenado para ese backend).
- GPU consumer: no se documenta soporte; por tamano, los pesos BF16 no caben en GPUs consumer de 8-12 GB sin conversion adicional, y el export no incluye cuantizacion.
- Opciones de despliegue: el repositorio proporciona un loader en PyTorch (`load_components.py`) para verificacion en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un export de componentes de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo-Tenstorrent-Tensix-Components (este) | Export de componentes del denoiser | no disponible | no aplica | Apache 2.0 | Hugging Face, 12,3 GB |
| Tongyi-MAI/Z-Image-Turbo | Modelo de difusion completo (base) | no disponible en la informacion | no aplica | Apache 2.0 | Hugging Face |
| Otros exports de componentes para Tensix | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria (exports de componentes para aceleradores) no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia es de alcance: este repositorio omite text encoder y VAE y no es ejecutable de extremo a extremo.

## Limitaciones y advertencias

- No es un modelo autonomo: sin adaptador de arquitectura, text encoder, VAE y scheduler no genera imagenes.
- No se ha realizado entrenamiento, calibracion ni cuantizacion; los pesos son una transformacion BF16 de los originales.
- La evaluacion publicada es solo de integridad en CPU; no hay evaluacion de calidad de imagen ni de rendimiento.
- El modelo base declara solo ingles y chino; el soporte multilingue mas alla de esos idiomas no esta documentado.
- Riesgo de sesgos y alucinacion visual heredado del modelo base Z-Image Turbo, no evaluado en este export.
- La licencia Apache 2.0 se declara a partir de la release original; la model card senala que la release primaria no incluye archivo de licencia raiz y que el NOTICE identifica origen y modificaciones.
- Se proporciona "tal cual", sin garantia ni respaldo del proyecto upstream.
- El uso comercial esta permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base y de cualquier componente de terceros integrado en el pipeline.
- El commit de pesos primarios esta fijado (`f332072`); cambios en el modelo base no se reflejan automaticamente en este export.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/Z-Image-Turbo-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Informe tecnico (arXiv): https://arxiv.org/abs/2511.22699
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Codigo del loader (en el repo): https://huggingface.co/Xylolabs/Z-Image-Turbo-Tenstorrent-Tensix-Components/blob/main/load_components.py
- Repositorio de codigo de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
