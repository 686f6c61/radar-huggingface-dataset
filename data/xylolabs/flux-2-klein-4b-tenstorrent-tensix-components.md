# Xylolabs/FLUX.2-klein-4B-Tenstorrent-Tensix-Components

## Resumen

FLUX.2-klein-4B-Tenstorrent-Tensix-Components es un archivo de componentes de operadores extraidos del modelo de difusion FLUX.2 klein 4B de Black Forest Labs, reempaquetados por Xylolabs como tensores BF16 portables para su uso en hardware Tenstorrent Tensix. No es un modelo generativo completo: contiene 213 operadores seleccionados del denoiser (cinco bloques dual-stream, veinte bloques single-stream, proyecciones de entrada de contexto/imagen y la proyeccion de salida), omitiendo el text encoder, el VAE y los operandos de condicionamiento y modulacion. Sin esos componentes adicionales y un adaptador de arquitectura, el archivo no puede generar imagenes por si mismo.

El paquete esta pensado para desarrolladores que trabajan con aceleradores Tenstorrent y necesitan los pesos de operadores del denoiser de FLUX.2 klein 4B en un formato verificado y reproducible. Cada tensor se almacena en BF16 con transformaciones documentadas (transposiciones, concatenaciones de Q/K/V y gate/up, slices y reshapes de escalas de normalizacion) registradas en `component.json` junto con checksums SHA256.

La relevancia actual es acotada: se trata de un artefacto de infraestructura para el ecosistema Tenstorrent, no de un modelo publicable como tal. Su utilidad depende de integrarlo en un pipeline completo de FLUX.2 klein 4B con el resto de componentes del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componentes de operadores del denoiser de FLUX.2 klein 4B (transformer de difusion); no es un modelo completo |
| Parametros totales | 213 operadores; 7.409.807.216 bytes en BF16 (aprox. 7,41 GB de pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 unicamente (todos los tensores almacenados en bfloat16) |
| Idiomas soportados | en (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), 213 archivos; incluye `component.json` y `load_components.py` |

## Arquitectura y entrenamiento

El archivo no incluye entrenamiento propio: son pesos derivados del modelo base `black-forest-labs/FLUX.2-klein-4B`, preservados como tensores BF16 con las transformaciones declaradas por el autor original. La arquitectura subyacente corresponde al denoiser de FLUX.2 klein 4B, con cinco bloques dual-stream y veinte bloques single-stream, mas proyecciones de contexto e imagen y proyeccion de salida. Los operandos lineales conservan sus layouts transpuestos declarados, y las concatenaciones de Q/K/V y gate/up se mantienen segun especificacion.

El proceso de exportacion verifica que los 213 tensores son finitos y bit-exactos respecto a los valores fuente guardados y a las transformaciones declaradas sobre los pesos del modelo primario fijado. Se comprobaron hashes de transferencia, roundtrips de safetensors, el loader de streaming publico y roundtrips de layout BF16 en host. No se reportan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de RLHF/DPO, ya que el artefacto no entrena nada: solo reempaqueta pesos existentes.

## Capacidades

- Preservacion de operadores del denoiser de FLUX.2 klein 4B en BF16 para integracion en pipelines de difusion sobre Tenstorrent Tensix.
- Verificacion de integridad: checksums SHA256 por archivo, comprobacion de nombres, formas, dtype y valores finitos mediante `load_components.py`.
- Streaming de componentes: el loader permite descargar y cargar selectivamente archivos individuales (por ejemplo, solo `ctx_emb.safetensors`).
- Conservacion de layouts logicos declarados (transposiciones, concatenaciones, slices, reshapes) para que la integracion respete la semantica del modelo original.
- Generacion de imagenes: no soportada de forma autonoma; requiere text encoder, VAE, operandos de condicionamiento/modulacion y un adaptador de arquitectura.
- Tool calling, agentes, razonamiento, codigo, matematicas, vision o audio: no aplica (no es un modelo de lenguaje).

## Casos de uso

- Integracion en runtime Tenstorrent Tensix: usar los 213 operadores como pesos del denoiser dentro de un pipeline completo de FLUX.2 klein 4B desplegado sobre aceleradores Tensix, aportando los componentes restantes (text encoder, VAE, modulacion).
- Desarrollo de kernels y operadores en Tensix: emplear los tensores BF16 verificados como referencia para validar implementaciones de operadores (Q/K/V, gate/up, proyecciones) contra los pesos oficiales.
- Verificacion de reproducibilidad: usar `component.json` y los checksums SHA256 para auditar que los pesos cargados coinciden bit a bit con las transformaciones declaradas sobre el modelo primario.
- Pruebas de carga selectiva: descargar solo subconjuntos (por ejemplo, `ctx_emb.safetensors`) para pruebas unitarias de proyecciones de contexto sin bajar los 7,41 GB completos.
- Benchmarking de memoria y ancho de banda en Tensix: medir el coste de cargar 7,41 GB de pesos BF16 mas buffers de trabajo en el dispositivo, como base para planificacion de capacidad.
- Investigacion sobre portabilidad de modelos de difusion: estudiar como se preservan layouts transpuestos y concatenaciones al migrar pesos de PyTorch a un backend Tensix, usando este archivo como caso documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas son de CPU (integridad, bit-exactitud, roundtrips) y que "speed is not reported here". No se aportan metricas de latencia, throughput ni calidad de generacion.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 7,41 GB solo para los pesos de los componentes, mas espacio para buffers de trabajo (no cuantificado en la informacion disponible).
- Hardware objetivo: aceleradores Tenstorrent Tensix (el paquete esta etiquetado para ese backend).
- GPU consumer: no aplica como objetivo; el artefacto esta orientado a Tensix, aunque los tensores BF16 son legibles en cualquier host con PyTorch y safetensors.
- Despliegue: carga mediante PyTorch, `safetensors` y `huggingface_hub` con el loader `load_components.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion parcial).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/FLUX.2-klein-4B-Tenstorrent-Tensix-Components | Componentes de denoiser (BF16) | 213 operadores, 7,41 GB | no disponible | Apache 2.0 | Hugging Face |
| black-forest-labs/FLUX.2-klein-4B | Modelo de difusion completo | no disponible en la informacion | no disponible | Apache 2.0 (segun el paquete derivado) | Hugging Face |
| Alternativas de difusion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros modelos de difusion no es posible con los datos proporcionados: este artefacto no es funcional de forma autonoma y no publica metricas de calidad ni velocidad.

## Limitaciones y advertencias

- No es un modelo completo: sin text encoder, VAE, operandos de condicionamiento/modulacion y adaptador de arquitectura no puede generar imagenes.
- Solo contiene BF16; no se ofrecen variantes cuantizadas (GGUF, INT8, FP8) ni formatos alternativos.
- El consumo de memoria (7,41 GB de pesos mas buffers) puede ser limitante en dispositivos con poca memoria.
- No se reportan benchmarks de calidad, latencia ni throughput; cualquier evaluacion de tarea debe realizarse en el pipeline integrado.
- Riesgo de alucinacion y sesgos: no evaluables en este artefacto; dependen del modelo base FLUX.2 klein 4B y de sus datos de entrenamiento, no documentados aqui.
- Idioma: metadatos limitados a `en`; el comportamiento multilingue del pipeline completo no esta cubierto por este paquete.
- Licencia Apache 2.0 heredada del release de Black Forest Labs; el `NOTICE` identifica fuente, modificaciones y alcance del archivo. Se proporciona "as is", sin garantia ni respaldo del autor original.
- No incluye metadatos de serializacion nativos; la integracion debe respetar los layouts logicos declarados en `component.json` para no romper la semantica de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/FLUX.2-klein-4B-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de codigo del loader (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/FLUX.2-klein-4B-Tenstorrent-Tensix-Components/blob/main/LICENSE
- Loader de componentes: https://huggingface.co/Xylolabs/FLUX.2-klein-4B-Tenstorrent-Tensix-Components/blob/main/load_components.py
