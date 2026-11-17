# yang29/afd-baseline-checkpoints

## Resumen

`yang29/afd-baseline-checkpoints` es un repositorio de checkpoints de investigación para generación de vídeo a partir de texto (text-to-video), publicado por el usuario yang29 en Hugging Face. No se trata de un modelo único listo para uso general, sino de un archivo de puntos de control evaluados procedentes de distintos métodos de entrenamiento (self-forcing, causal-forcing, Astrolabe y AdvDMD), organizados en directorios por método y por paso de entrenamiento.

El repositorio se etiqueta con el pipeline `text-to-video` y la librería `self-forcing`, e incluye bundles para vídeo corto y exportaciones compactas de inferencia para vídeo largo. Cada bundle incorpora un fichero `archive_provenance.json` con la procedencia de la evaluación, nombres originales de ficheros, tamaños en bytes y sumas de verificación SHA256, lo que lo convierte en un artefacto orientado a reproducibilidad y auditoría de experimentos más que a despliegue en producción.

La relevancia actual del repositorio radica en que documenta y preserva checkpoints intermedios de líneas de investigación en generación de vídeo causal, un área activa donde la comparación reproducible de métodos es difícil por la dispersión de artefactos. El tamaño del repositorio es de 89,6 GB y acumula 3946 descargas, aunque cuenta con un solo "like". No se dispone de información sobre arquitectura, número de parámetros ni longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints originales (LoRA, pesos LoRA, ficheros de optimizador/scaler, cabezas de discriminador); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base. El repositorio contiene artefactos de varios métodos de entrenamiento etiquetados como `self-forcing`, `causal-forcing`, `astrolabe` y `advdmd`. Los bundles de vídeo corto se almacenan bajo `short-self-forcing/METHOD/step-NNN/` y `short-causal-forcing/METHOD/step-NNN/`, mientras que las exportaciones compactas de inferencia para vídeo largo se ubican en `long-self-forcing/METHOD/step-NNN/`.

Según la model card, los bundles cortos de Astrolabe incluyen configuración LoRA, pesos LoRA y los ficheros originales de optimizador y scaler. Los ficheros cortos de AdvDMD contienen el LoRA del generador original y las cabezas del discriminador. Las exportaciones de vídeo largo preservan el formato guardado original y son distintas de los checkpoints completos de reanudación que mantiene el entrenamiento activo de vídeo largo. Los pesos de inicialización originales permanecen en sus repositorios upstream y no se incluyen en este archivo. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`).
- Soporte de evaluación por pasos de entrenamiento (`step-NNN`), lo que permite comparar la evolución del modelo a lo largo del entrenamiento.
- Inclusión de artefactos de métodos diferenciados: self-forcing, causal-forcing, Astrolabe y AdvDMD.
- Exportaciones de inferencia compactas para vídeo largo.
- Verificación de integridad mediante SHA256 y procedencia de evaluación documentada en `archive_provenance.json`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio permite a un equipo recuperar checkpoints concretos por método y paso de entrenamiento para replicar las evaluaciones publicadas en los datasets de referencia asociados.
- Comparación de métodos de generación de vídeo causal: al conservar bundles de self-forcing, causal-forcing, Astrolabe y AdvDMD bajo una misma estructura, facilita la comparación controlada entre enfoques.
- Auditoría de integridad de artefactos: los ficheros `archive_provenance.json` con checksums SHA256 permiten verificar que los pesos evaluados coinciden con los originales antes de retirar copias locales.
- Estudio de la evolución del entrenamiento: los checkpoints por paso (`step-NNN`) permiten analizar cómo cambia la calidad de generación a lo largo del entrenamiento.
- Fine-tuning posterior sobre LoRA: los bundles de Astrolabe incluyen configuración y pesos LoRA, lo que permite partir de adaptadores ya entrenados para experimentos derivados.
- Investigación en destilación y discriminadores: los ficheros de AdvDMD con cabezas de discriminador son útiles para estudiar enfoques adversarios en generación de vídeo.
- Evaluación de inferencia en vídeo largo: las exportaciones compactas de `long-self-forcing` permiten probar generación de vídeo largo sin cargar los checkpoints completos de reanudación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los siguientes datasets para resultados y procedencia de generación y configuración:

- `yang29/afd-baselines-vbench-step80-20261109`
- `yang29/afd-baselines-vbench-step160-20261110`
- `yang29/afd-long-video-vbench-100prompts`
- `yang29/afd-causal-forcing-baselines-vbench`

No se dispone de las cifras concretas de dichos datasets en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el repositorio usa la librería `self-forcing` y preserva el formato original de los checkpoints.
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 89,6 GB, lo que implica requisitos de almacenamiento considerables para su descarga completa.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría ni ofrece datos de parámetros, contexto o rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un archivo de checkpoints de investigación con estructura por método y paso de entrenamiento.
- Licencia no disponible: no puede asumirse permiso para uso comercial; es necesario contactar con el autor o consultar el repositorio antes de cualquier uso productivo.
- Idiomas no disponibles: no se documenta el soporte multilingüe.
- Arquitectura y parámetros no documentados: dificulta estimar requisitos de cómputo y memoria.
- Los pesos de inicialización no están incluidos; dependen de repositorios upstream que deben obtenerse por separado.
- Riesgo de obsolescencia: los checkpoints corresponden a evaluaciones fechadas (noviembre de 2026) y pueden no reflejar el estado actual de las líneas de entrenamiento.
- Tamaño elevado del repositorio (89,6 GB), con posibles problemas de ancho de banda y almacenamiento.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yang29/afd-baseline-checkpoints
- Dataset de resultados (step 80): https://huggingface.co/datasets/yang29/afd-baselines-vbench-step80-20261109
- Dataset de resultados (step 160): https://huggingface.co/datasets/yang29/afd-baselines-vbench-step160-20261110
- Dataset de vídeo largo (100 prompts): https://huggingface.co/datasets/yang29/afd-long-video-vbench-100prompts
- Dataset de baselines causal-forcing: https://huggingface.co/datasets/yang29/afd-causal-forcing-baselines-vbench
