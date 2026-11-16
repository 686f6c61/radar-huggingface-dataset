# yepher/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B es un modelo multimodal (texto, audio y vision) desarrollado por Liquid AI, construido sobre la arquitectura de estado recurrente (SSM hibrida) caracteristica de la familia LFM. Este repositorio concreto, publicado por el usuario yepher, no es un modelo nuevo ni un fine-tune: es un espejo (mirror) sin modificaciones del archivo cuantizado `LFM3-Omni-2B-Q4_K_M.gguf` publicado por Liquid AI, pensado como fuente de descarga estable para inferencia de texto en dispositivo dentro de una app de notas.

El modelo base cuenta con 1.728.801.600 parametros reales (segun los safetensors del modelo original), lo que lo situa en la categoria de 2B. Al ser un mirror, no aporta mejoras ni cambios de pesos: su interes practico radica en ofrecer el GGUF Q4_K_M con verificacion de integridad documentada (SHA-256 y revision upstream fijada), algo relevante para pipelines de despliegue que necesitan reproducibilidad.

Es relevante ahora porque los modelos pequenos multimodales con cuantizacion GGUF permiten ejecutar inferencia local en hardware de consumo, y este mirror documenta explicitamente la procedencia y el hash del archivo, facilitando auditorias de cadena de suministro en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM de Liquid AI; el mirror no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido en este mirror) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con condiciones de uso comercial |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. El modelo pertenece a la familia LFM3 de Liquid AI y se distribuye como modelo multimodal "Omni", lo que implica componentes separados para audio y vision (proyectores) ademas del modelo de lenguaje. El mirror solo incluye el archivo de pesos cuantizado Q4_K_M del modelo de lenguaje; los proyectores de audio y vision, asi como otras cuantizaciones, deben obtenerse del repositorio upstream de Liquid AI.

El archivo tiene un tamano exacto de 1.099.630.080 bytes y un SHA-256 documentado (`9f8d30e9...c9893e2`), con la revision upstream fijada en `3d29af2ad166f8299c2d820937e47dc0add20ffc`. No se documentan en esta informacion datos sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Capacidades multimodales en el modelo base: audio y vision mediante proyectores separados (no incluidos en este mirror).
- Inferencia en dispositivo via llama.cpp, orientada a aplicaciones locales.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, modo thinking ni cobertura multilingue concreta.

## Casos de uso

- Inferencia de texto en aplicaciones de notas en dispositivo: el mirror se publico precisamente para dar una fuente de descarga estable al motor de inferencia local de una app de notas; el GGUF Q4_K_M (~1,1 GB) cabe en memoria unificada de portatiles y moviles de gama alta.
- Despliegue reproducible con verificacion de integridad: pipelines que necesitan fijar un hash SHA-256 y una revision upstream concreta pueden usar este repositorio para garantizar que los pesos no han sido alterados.
- Prototipado rapido con llama.cpp: al ser un unico archivo GGUF, se puede cargar en llama.cpp u Ollama sin conversion previa para pruebas de generacion de texto.
- Entornos con conectividad limitada o requisitos de privacidad: la inferencia local evita enviar texto a servicios externos, adecuado para aplicaciones de notas o dictado con datos sensibles.
- Espejo de respaldo ante caidas del repositorio oficial: util como fuente secundaria en sistemas de descarga automatizada con redundancia.
- Base para experimentacion multimodal: combinando este GGUF con los proyectores de audio/vision del repositorio upstream se podria explorar inferencia multimodal local, aunque requiere descargar componentes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa 1,1 GB; la inferencia requiere adicionalmente memoria para el contexto KV, por lo que un presupuesto de 2-3 GB de RAM/VRAM es razonable para contextos moderados (estimacion, no dato oficial).
- GPU recomendadas: no disponible en la documentacion; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutarlo.
- Cabe en GPU consumer: si, previsiblemente en RTX 3050/4060 y superiores, asi como en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (previa importacion del GGUF), y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B (este mirror) | ~1,73 B | no disponible | LFM Open License v1.0 | GGUF Q4_K_M | Mirror no oficial, solo pesos de texto |
| LiquidAI/LFM3-Omni-2B (upstream) | ~1,73 B | no disponible | LFM Open License v1.0 | safetensors + GGUF | Repositorio oficial, incluye proyectores audio/vision |
| Otros modelos ~2B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial: no lo mantiene Liquid AI y no constituye una fuente canonica de soporte.
- Solo contiene el archivo de pesos de texto Q4_K_M; los proyectores de audio y vision no estan incluidos, por lo que las capacidades multimodales del modelo base no estan disponibles solo con este repositorio.
- La licencia LFM Open License v1.0 incluye condiciones especificas de uso comercial que deben revisarse en el archivo LICENSE antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse con el modelo base y su model card upstream.
- Idiomas soportados y longitud de contexto no verificados en esta informacion.
- Al ser una cuantizacion Q4_K_M, cabe esperar una perdida de calidad respecto a los pesos completos, aunque no se cuantifica en la documentacion.
- Repositorio con cero descargas y creado recientemente: sin historial de uso que permita validar su fiabilidad mas alla del hash publicado.

## Enlaces

- Repositorio del mirror: https://huggingface.co/yepher/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio GGUF upstream: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Revision upstream fijada: `3d29af2ad166f8299c2d820937e47dc0add20ffc`
- Licencia LFM Open License v1.0: archivo LICENSE en el repositorio del mirror
