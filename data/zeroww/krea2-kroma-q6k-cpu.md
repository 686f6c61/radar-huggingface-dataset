# ZeroWw/krea2-kroma-q6k-cpu

## Resumen

Krea 2 Kroma v0.3.1 OPD (Q6_K) es un paquete de inferencia listo para ejecutar que permite generar imágenes con stable-diffusion.cpp sobre CPU, sin necesidad de GPU. No se trata de un modelo original, sino de un repaquetado y cuantización realizado por el usuario ZeroWw a partir de tres componentes: el diffusion transformer `kroma-v0.3.1-turbo-opd` (un fine-tune de Krea 2 publicado por lodestones), un text encoder Qwen3-VL-4B-Instruct abliterado y el VAE de Wan 2.1. El conjunto se distribuye en formato GGUF con cuantización Q6_K y está pensado para el binario `sd-cli` de stable-diffusion.cpp.

El modelo subyacente, Krea 2, es un modelo de difusión texto-a-imagen desarrollado por krea que condiciona sobre los hidden states de Qwen3-VL-4B, lo que implica que el text encoder no puede sustituirse por otro LLM. La variante Kroma añade un ajuste fino con modo turbo (OPD) que permite generar con solo 8 pasos y CFG 1.0, reduciendo drásticamente el coste computacional frente a los pipelines de difusión convencionales de 20-50 pasos.

Su relevancia práctica radica en que demuestra que es viable ejecutar un pipeline completo de generación de imágenes de alta calidad en hardware sin GPU: el autor reporta una imagen de 960x544 en aproximadamente 11 minutos con solo 2 hilos de CPU. Esto lo convierte en una opción interesante para entornos sin acelerador, pruebas de concepto y despliegues de bajo presupuesto, a costa de una latencia muy elevada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Krea 2) con text encoder Qwen3-VL-4B y VAE Wan 2.1 |
| Parámetros totales | 4.022.468.096 (según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (GGUF); el autor advierte que quants del text encoder Q4_K_M o inferiores siguen peor las instrucciones detalladas |
| Idiomas soportados | no disponible (el prompt de ejemplo está en inglés) |
| Licencia | other / see-licenses-section (Krea 2 Community License para el modelo base; ver sección de créditos) |
| Formato de pesos | GGUF (diffusion transformer y text encoder) y safetensors (VAE) |

## Arquitectura y entrenamiento

El componente principal es un diffusion transformer correspondiente a Krea 2, concretamente el checkpoint `kroma-v0.3.1-turbo-opd` de lodestones, un fine-tune de Krea 2 con variante turbo (OPD) que opera con 8 pasos de muestreo y CFG 1.0. El condicionamiento textual se realiza sobre los hidden states de Qwen3-VL-4B-Instruct, en este caso una variante abliterada (dirección de rechazo eliminada) publicada por Huihui. El pipeline se completa con el VAE de Wan 2.1 para la decodificación latente a píxeles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo original. El repositorio es exclusivamente un artefacto de empaquetado y cuantización: no documenta el proceso de entrenamiento, sino únicamente la conversión a GGUF Q6_K y los parámetros de inferencia recomendados (8 pasos, CFG 1.0, `--flash-attn off,diffusion=on`, `--vae-tiling`). La innovación técnica destacable es la combinación del modo turbo con cuantización Q6_K para hacer viable la inferencia en CPU.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts descriptivos en lenguaje natural.
- Condicionamiento textual de alta fidelidad mediante Qwen3-VL-4B, que permite prompts largos y detallados (el ejemplo del autor supera las 100 palabras).
- Generación rápida en pasos: 8 pasos de muestreo con CFG 1.0 gracias al checkpoint turbo (OPD).
- Ejecución en CPU pura: probado con 2 hilos y sin GPU.
- Soporte de tiling de VAE para reducir el uso de memoria en resoluciones moderadas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de difusión, no un LLM conversacional.
- El text encoder no genera texto en este pipeline; se usa únicamente para producir embeddings de prompt.
- Capacidades multilingües: no documentadas; el único ejemplo disponible está en inglés.

## Casos de uso

- Generación de imágenes en entornos sin GPU: el paquete está diseñado para ejecutarse con `sd-cli` en CPU, lo que permite obtener imágenes en servidores, portátiles o contenedores sin acelerador, a cambio de latencias de varios minutos por imagen.
- Pruebas de concepto y prototipado de prompts: al no requerir GPU, un equipo puede validar estilos, composiciones y descripciones antes de invertir en hardware o en un pipeline de producción con GPU.
- Generación por lotes de baja prioridad: tareas que no son sensibles a la latencia (por ejemplo, generación nocturna de ilustraciones de catálogo) pueden ejecutarse en CPU mientras la GPU se reserva para otras cargas.
- Creación de material visual para documentación técnica o blogs: prompts detallados con control de iluminación, lente y composición, como el ejemplo del propio autor (retrato cinematográfico con neones y lluvia).
- Investigación sobre cuantización de modelos de difusión: el repo sirve como caso de estudio de cómo afecta Q6_K al seguimiento de prompts frente a quants menores (Q4_K_M y siguientes), según advierte el propio autor.
- Despliegue en entornos con restricciones de hardware o de presupuesto: al caber en un repo de 14,1 GB y ejecutarse en CPU, es adecuado para laboratorios, aulas o demos offline sin acceso a GPUs.
- Integración en pipelines de stable-diffusion.cpp: al ser compatible con `sd-cli`, puede encadenarse en scripts de automatización que ya usen esta herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento reportado por el autor es empírico: una imagen de 960x544 con 8 pasos y semilla 42 tarda aproximadamente 11 minutos en 2 hilos de CPU. No se proporcionan métricas de FID, CLIP score ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo CPU documentado; en modo GPU, el repo completo ocupa 14,1 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar todos los componentes sin cuantización adicional.
- GPU recomendadas: no documentadas por el autor; el paquete está probado exclusivamente en CPU.
- ¿Cabe en GPU de consumo? No hay datos específicos; el tamaño del repo (14,1 GB) sugiere que una GPU de 16 GB o más podría alojar el conjunto completo, pero no está verificado en la información disponible.
- Despliegue: stable-diffusion.cpp (`sd-cli`) con soporte de GGUF; requiere una versión reciente del master, ya que el soporte de Krea 2 es nuevo y los flags cambian con frecuencia.
- CPU: probado con 2 hilos; el autor recomienda `-t "$(nproc)"` para usar todos los núcleos disponibles.
- Latencia: aproximadamente 11 minutos por imagen de 960x544 con 8 pasos en 2 hilos de CPU.
- Throughput: no disponible.
- Memoria: se recomienda `--vae-tiling` en CPU para reducir el uso de memoria; en builds con GPU se puede subir la resolución (por ejemplo, 1024x1024) y desactivar el tiling.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Kroma Q6_K (este repo) | 4.022.468.096 | no disponible | 960x544 en ~11 min en 2 hilos de CPU | Krea 2 Community License (other) | GGUF en HuggingFace |
| Krea 2 (modelo base, krea) | no disponible | no disponible | no disponible | Krea 2 Community License | HuggingFace (krea) |
| lodestones/Kroma | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-VL-4B-Instruct | 4B (text encoder) | no disponible | no disponible | no disponible | HuggingFace (Qwen) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo original: es un repaquetado y cuantización de terceros; la calidad final depende de Krea 2, Kroma, Qwen3-VL-4B y Wan 2.1.
- Licencia restrictiva: el modelo base Krea 2 se distribuye bajo la Krea 2 Community License, y el repo indica "other / see-licenses-section". Es obligatorio revisar cada licencia (Krea 2, Kroma, Qwen3-VL-4B, Wan 2.1, stable-diffusion.cpp) antes de cualquier uso comercial o redistribución.
- El text encoder no es intercambiable: Krea 2 condiciona sobre los hidden states de Qwen3-VL-4B, por lo que no se puede sustituir por otro LLM.
- Cuantizaciones agresivas degradan el seguimiento de prompts: el autor advierte que Q4_K_M y quants inferiores del text encoder siguen notablemente peor las instrucciones detalladas.
- Latencia muy alta en CPU: unos 11 minutos por imagen de 960x544 con 2 hilos; no es apto para aplicaciones interactivas en ese modo.
- Soporte inestable: el soporte de Krea 2 en stable-diffusion.cpp es reciente y los flags cambian con frecuencia; se requiere una versión reciente del master.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomías incorrectas, texto ilegible en la imagen o composiciones incoherentes con el prompt.
- Sesgos: no documentados en la información disponible; cabe esperar los sesgos propios de los datasets de entrenamiento de Krea 2 y Qwen3-VL, no especificados aquí.
- Uso responsable: el autor prohíbe explícitamente crear imágenes sexuales o engañosas de personas reales sin su consentimiento.
- Idiomas: no hay información sobre el soporte multilingüe del pipeline; el único ejemplo verificado está en inglés.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZeroWw/krea2-kroma-q6k-cpu
- Modelo base (Kroma): https://huggingface.co/lodestones/Kroma
- Krea 2 (organización): https://huggingface.co/krea
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
