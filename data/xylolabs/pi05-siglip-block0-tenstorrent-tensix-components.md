# Xylolabs/pi05-SigLIP-Block0-Tenstorrent-Tensix-Components

## Resumen

Este repositorio no contiene un modelo completo, sino un componente aislado del modelo robótico pi0.5 de LeRobot: concretamente el primer bloque del codificador de visión SigLIP, extraído y serializado en tensores portables por Xylolabs para su uso en hardware Tenstorrent Tensix. El objetivo es facilitar el despliegue de la parte visual de pi0.5 sobre aceleradores Tensix, manteniendo los valores originales en FP32 sin pérdida de precisión.

El paquete incluye doce tensores en FP32 con las proyecciones QKV fusionadas de forma lossless, junto con un cargador en Python (`load_components.py`) que verifica hashes, formas, dtypes y valores finitos. No es un modelo ejecutable por sí mismo: requiere la arquitectura original de pi0.5 y el resto de bloques de visión, el modelo de lenguaje/acción y la política robótica completa.

Es relevante para equipos que trabajan en inferencia de políticas robóticas sobre hardware Tenstorrent y necesitan portar componentes de pi0.5 de forma controlada, verificable y compatible con los términos de licencia Gemma heredados del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de vision transformer SigLIP (componente aislado de pi0.5); ancho oculto 1152, 16 cabezas de atencion, MLP 4304, GELU tanh, LayerNorm epsilon 1e-6 |
| Parametros totales | no disponible (solo se publica el bloque; el modelo base pi0.5 no reporta cifra en esta informacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los tensores se distribuyen en FP32 |
| Idiomas soportados | en |
| Licencia | Gemma Terms of Use (con restricciones de la seccion 3.2 incorporadas como condiciones vinculantes); se conservan terminos Apache 2.0 del backbone heredado |
| Formato de pesos | safetensors (FP32), con `component.json` que declara formas, dtypes y hashes |

## Arquitectura y entrenamiento

El componente corresponde al primer bloque del codificador visual SigLIP integrado en pi0.5, la política robótica vision-language-action de LeRobot. La arquitectura del bloque sigue el diseño estandar de SigLIP: atencion multi-cabeza con 16 cabezas sobre un ancho oculto de 1152, MLP de 4304 con activacion GELU en aproximacion tanh y LayerNorm con epsilon 1e-6. Las proyecciones Q, K y V y sus sesgos se han concatenado en un unico tensor sin redondeo, preservando los valores originales en FP32.

No se ha realizado entrenamiento adicional: se trata de una extraccion y reserializacion de pesos del modelo base `lerobot/pi05_base`, verificada contra la identidad LFS del fichero original. La model card indica que los doce tensores coinciden exactamente con los parametros fuente o con la concatenacion QKV declarada, y que todos los valores son finitos. No se documentan datos de entrenamiento, tokens vistos, ni etapas de RLHF/DPO en esta informacion, ya que corresponden al modelo base original y no al componente exportado.

## Capacidades

- Extraccion lossless del primer bloque de vision SigLIP de pi0.5 en FP32.
- Fusion de proyecciones QKV (orden Q, K, V) sin perdida de precision.
- Cargador en Python (`load_components.py`) con verificacion de hashes, formas, dtypes y valores finitos.
- Serializacion declarativa via `component.json` con formas, dtypes y hashes por tensor.
- Preparado para integracion en pipelines de hardware Tenstorrent Tensix.
- No incluye capacidades de generacion, razonamiento, codigo, tool calling ni agentes por si mismo.
- No es un modelo autonomo: requiere la arquitectura SigLIP original y el resto de pi0.5 para funcionar.

## Casos de uso

- Portado de la torre visual de pi0.5 a Tenstorrent Tensix: usar el bloque extraido como unidad de validacion para comprobar que la implementacion de SigLIP en Tensix produce las mismas activaciones que la referencia FP32 en PyTorch.
- Verificacion numerica de kernels de atencion: el bloque permite comparar la salida de kernels QKV fusionados en Tensix contra la concatenacion lossless publicada, aislando errores de precision en un unico bloque.
- Desarrollo de cargadores de componentes para pipelines robóticos: el ejemplo de streaming con `huggingface_hub` sirve como plantilla para cargar bloques individuales de pi0.5 sin descargar el modelo completo.
- Integracion en cadenas de compilacion para aceleradores: el `component.json` con formas, dtypes y hashes facilita la generacion automatica de grafos y la validacion de artefactos en CI.
- Auditoria de licencias en despliegues robóticos: al incluir `GEMMA_TERMS.txt`, `GEMMA_PROHIBITED_USE_POLICY.txt` y `NOTICE` con el aviso obligatorio, el paquete sirve como referencia para cumplir los requisitos de distribucion de componentes derivados de pi0.5.
- Reproducibilidad de experimentos: al fijar la identidad LFS del safetensors original y verificar cada tensor, el bloque permite reproducir exactamente la primera capa visual en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas cualifican la extraccion y serializacion, pero que un bloque integrado o la politica completa requieren su propia evaluacion de salida y tarea, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo estimada: aproximadamente 0,06 GB solo para los pesos del componente, mas buffers de trabajo.
- Almacenamiento en disco: aproximadamente 61 MB para el fichero safetensors.
- GPU recomendadas: no aplica de forma especifica; el componente esta pensado para hardware Tenstorrent Tensix.
- Compatibilidad con GPU de consumo: los pesos en FP32 caben en cualquier GPU moderna, pero el uso previsto es en Tensix.
- Opciones de despliegue: carga via PyTorch y safetensors con `huggingface_hub.snapshot_download`; el cargador `load_components.py` realiza streaming del bloque seleccionado.
- Latencia y throughput: no disponibles; la model card no reporta metricas de velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/pi05-SigLIP-Block0-Tenstorrent-Tensix-Components | Componente de vision (bloque SigLIP de pi0.5) | no disponible | no disponible | Gemma Terms | Hugging Face, 0 descargas |
| lerobot/pi05_base | Politica VLA completa (modelo base) | no disponible | no disponible | no disponible en esta informacion | Hugging Face |
| google/paligemma-3b-pt-224 | Modelo VLM (backbone SigLIP + Gemma) | ~3B | no disponible | Gemma Terms | Hugging Face |

La comparativa es limitada: el componente aqui descrito no es funcionalmente equivalente a los modelos completos, ya que solo contiene un bloque de vision y requiere integracion con la arquitectura original.

## Limitaciones y advertencias

- No es un modelo ejecutable: contiene unicamente el primer bloque de vision SigLIP; faltan los bloques posteriores, el modelo de lenguaje/accion y la politica robótica.
- Requiere la arquitectura SigLIP original con ancho 1152, 16 cabezas, MLP 4304, GELU tanh y LayerNorm epsilon 1e-6 para integrarse correctamente.
- El orden del QKV fusionado es Q, K, V; un orden distinto produce resultados incorrectos sin error explicito.
- Solo se ha validado la extraccion y serializacion; no hay evaluacion de la politica integrada ni metricas de tarea o velocidad.
- Licencia Gemma Terms of Use con restricciones de uso de la seccion 3.2 incorporadas como condiciones vinculantes; el uso comercial y la redistribucion estan sujetos a dichos terminos.
- Idioma declarado: solo ingles.
- Riesgo de sesgos y alucinacion: no evaluado en esta informacion; aplican los del modelo base pi0.5 y su backbone.
- El repositorio tiene 0 descargas y 0 likes, sin senales de adopcion ni validacion externa.
- Se entrega "as is", sin garantia.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/pi05-SigLIP-Block0-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper pi0.5: https://huggingface.co/papers/2504.16054 (arXiv:2504.16054)
- PaliGemma fuente: https://huggingface.co/google/paligemma-3b-pt-224
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Repositorio de codigo relacionado: https://github.com/XylolabsInc/tensix-bfp-gptq
- Cargador de componentes: https://huggingface.co/Xylolabs/pi05-SigLIP-Block0-Tenstorrent-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/pi05-SigLIP-Block0-Tenstorrent-Tensix-Components/blob/main/LICENSE
