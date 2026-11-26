# syaffers/dummy-gated

## Resumen

`syaffers/dummy-gated` es un modelo de generación de texto publicado en Hugging Face por el usuario `syaffers`. Por su nombre, sus etiquetas (`test`, `dummy`) y el recuento real de parámetros en safetensors (30.816 parámetros, es decir, unos 31 mil, no millones), se trata de un artefacto de prueba y no de un modelo entrenado para uso real. El repositorio está marcado como restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de poder descargar los pesos.

La relevancia de esta ficha es, por tanto, acotada: sirve para documentar qué contiene el repositorio, verificar su naturaleza de dummy y advertir de que no debe emplearse en producción. La arquitectura declarada en las etiquetas es `llama`, con pipeline `text-generation`, y el formato de pesos es `safetensors`, compatible con la librería `transformers`.

No se dispone de información sobre el desarrollador, el proceso de entrenamiento, el conjunto de datos ni el contexto soportado. La licencia declarada es Apache 2.0, aunque el acceso restringido añade una condición adicional de aceptación en la plataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | llama (según etiquetas; sin confirmar en configuración) |
| Parámetros totales | 30.816 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Las etiquetas del repositorio indican `llama` y `transformers`, lo que sugiere una arquitectura de tipo transformer decoder-only con la interfaz estándar de la librería. Sin embargo, con 30.816 parámetros totales, el modelo es varios órdenes de magnitud menor que cualquier LLaMA publicada (desde 7B en adelante), por lo que la etiqueta debe interpretarse como una declaración de compatibilidad de plantilla, no como una arquitectura real de esa familia.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de ajuste (RLHF, DPO, SFT). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El tamaño del repositorio (0.0 GB) y el recuento de parámetros confirman que se trata de un artefacto mínimo de prueba.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, pero con 30.816 parámetros la calidad de generación será trivial o inexistente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según etiquetas, lo que indica que puede desplegarse con la infraestructura estándar de Hugging Face.

## Casos de uso

- Pruebas de integración de pipelines: sirve para validar el flujo de descarga, carga con `transformers` y ejecución de `text-generation` sin consumir recursos significativos.
- Verificación de repositorios gated: útil para comprobar el comportamiento de la API de Hugging Face al solicitar acceso a un modelo restringido y gestionar tokens de autenticación.
- Test de CI/CD en despliegues de TGI: permite validar el arranque de `text-generation-inference` y la compatibilidad de endpoints con un artefacto de tamaño despreciable.
- Pruebas de empaquetado y serialización safetensors: valida la lectura de ficheros de pesos y la coherencia de metadatos en herramientas internas.
- Simulación de carga en entornos de evaluación: útil para medir latencia de arranque y overhead de infraestructura sin coste de GPU real.
- Docencia y ejemplos de estructura de repositorio: ilustra cómo se organiza una model card mínima con licencia, etiquetas y acceso restringido.

En ningún caso debe emplearse para generación de texto real, atención al cliente, generación de código ni ninguna tarea productiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 para los pesos (30.816 parámetros × 4 bytes ≈ 123 KB), más el overhead del runtime de `transformers` y de la tokenizer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `text-generation-inference`), endpoints compatibles de Hugging Face. No se declara soporte de GGUF, por lo que llama.cpp u Ollama no están garantizados sin conversión manual.
- Latencia y throughput: no disponibles; al ser un dummy, las métricas no serían representativas de ningún modelo real.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de 30.816 parámetros con propósito de prueba en la información proporcionada; las alternativas reales de la familia LLaMA (7B, 13B, 70B) no son comparables en tamaño ni en finalidad.

## Limitaciones y advertencias

- Modelo dummy: el nombre y las etiquetas (`test`, `dummy`) indican que no ha sido entrenado para tareas reales; la salida será de baja calidad o incoherente.
- Acceso restringido: requiere aceptar condiciones en Hugging Face y autenticarse con un token para descargar los pesos.
- Sin información de sesgos: no se documentan sesgos conocidos, pero tampoco hay evaluación que los descarte.
- Riesgo de alucinación: total, al no existir conocimiento aprendido útil.
- Idiomas: no se declara ninguno; no debe asumirse soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el acceso gated añade condiciones de la plataforma que deben revisarse.
- No apto para producción: no debe integrarse en sistemas reales ni presentarse como un modelo funcional.

## Enlaces

- Hugging Face: https://huggingface.co/syaffers/dummy-gated
