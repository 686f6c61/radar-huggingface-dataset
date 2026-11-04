# wright802/Qwen3.8-Flash-Next-GSQ-RCO-Coder-Basalt

## Resumen

Qwen3.8-Flash-Next GSQ-RCO Coder Basalt es un empaquetado comunitario no oficial del modelo Qwen3.8-Flash-Next de Qwen, convertido al formato `.basalt` (versión 2) para el motor de inferencia Basalt. El paquete lo publica el usuario wright802 y parte del GGUF cuantizado en IQ1_M que ISTA-DASLab distribuye de la variante Coder. No está afiliado ni a Qwen, ni a ISTA-DASLab, ni al autor de Basalt.

El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 48 bloques y 256 expertos por capa en esta variante Coder, que conserva la mitad de los 512 expertos por capa del modelo completo. El pack ocupa unos 62 GB y está pensado para ejecutarse con Basalt v0.2.0 o una compilación compatible, que lee únicamente packs de versión 2. Incluye además un perfil de expertos (`qwen4exp-48x256.prof`) derivado del `expert-profile-coder.bin` del proyecto Strata, necesario porque Basalt v0.2.0 solo distribuye un perfil 48x512.

Su relevancia es acotada pero concreta: permite ejecutar una variante Coder de un modelo MoE grande en hardware de consumo mediante cuantización extrema IQ1_M y un motor especializado en descompresión de expertos. El autor reporta unos 150-165 tokens por segundo en un portátil con RTX 5090 Laptop (24 GB de VRAM) y 32 GB de RAM, usado como backend de Cline con contexto de 131072 tokens. Se trata de un único reporte de uso, no de un benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 bloques x 256 expertos por capa en la variante Coder) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 131072 tokens (según el uso reportado con Cline) |
| Tipos de cuantización | IQ1_M (expertos); secciones de drafter y visión copiadas del pack oficial IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-license-1.0) |
| Formato de pesos | `.basalt` versión 2 (pack de ~62 GB) + perfil `.prof` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next más allá de su naturaleza MoE: el pack declara 48 bloques con 256 expertos por capa, lo que corresponde a la variante Coder que conserva la mitad de los 512 expertos por capa del modelo completo. El pack incorpora además secciones de drafter (decodificación especulativa) y de visión, copiadas byte a byte del pack oficial IQ3_XXS de Basalt mediante la opción `--sections-from` del conversor.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. La información sobre el entrenamiento original corresponde a Qwen y a ISTA-DASLab, no a este empaquetado. La innovación técnica relevante de este artefacto es el propio formato `.basalt` v2, orientado a la descompresión eficiente de expertos MoE, junto con el perfil de expertos específico para el layout 48x256 que el motor necesita para arrancar este pack.

## Capacidades

- Generación de código: la variante es explícitamente Coder, orientada a tareas de programación.
- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Capacidades de visión: el pack incluye secciones de visión copiadas del pack oficial IQ3_XXS.
- Decodificación especulativa: incorpora secciones de drafter para acelerar la inferencia.
- Integración con clientes compatibles con la API de OpenAI: el autor lo usó como backend de Cline con endpoint compatible.
- Soporte de contexto largo: 131072 tokens en la configuración reportada.
- Tool calling / function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en el IDE: el pack se integra como backend compatible con OpenAI en clientes como Cline, con 131072 tokens de contexto, lo que permite mantener conversaciones largas sobre un repositorio y generar parches de código sin perder el hilo.
- Autocompletado y generación de código en local: al ejecutarse en un portátil con RTX 5090 Laptop y 32 GB de RAM a 150-165 tokens/s, es viable como copiloto de programación sin depender de servicios en la nube.
- Experimentación con motores de inferencia especializados: sirve para evaluar Basalt v0.2.0 y el formato `.basalt` v2 con un modelo MoE grande cuantizado a IQ1_M, incluyendo el manejo de perfiles de expertos personalizados.
- Investigación sobre cuantización extrema: permite estudiar el comportamiento de un MoE Coder a IQ1_M y comparar la calidad frente a cuantizaciones mayores (el pack oficial IQ3_XXS) usando las mismas secciones de drafter y visión.
- Despliegue en entornos con VRAM limitada: con 24 GB de VRAM y 32 GB de RAM se puede servir el modelo en una sola máquina, útil para prototipos y demos internas sin infraestructura de datacenter.
- Reproducción de conversiones comunitarias: el repositorio documenta el comando de conversión y los SHA-256 de los shards de origen, lo que facilita reproducir o auditar el empaquetado para pipelines de validación de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no ha ejecutado las pruebas de calidad (quality gates) de Basalt sobre este pack y que la cifra de 150-165 tokens/s es un único reporte de uso, no un benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el uso reportado es de 24 GB de VRAM (RTX 5090 Laptop) con 32 GB de RAM para el pack de ~62 GB.
- GPU recomendadas: no disponible; el único hardware reportado es una RTX 5090 Laptop GPU.
- ¿Cabe en GPU de consumo? Sí, según el reporte del autor, en una RTX 5090 Laptop con 24 GB de VRAM, apoyándose en RAM del sistema.
- Motor de despliegue: Basalt v0.2.0 o compilación compatible (solo lee packs de versión 2); requiere el perfil `qwen4exp-48x256.prof` en `data/profiles/` del árbol del motor.
- Latencia y throughput: aproximadamente 150-165 tokens por segundo según el reporte del autor (no verificado como benchmark).
- Alternativas como vLLM, llama.cpp, Ollama o TGI: no disponibles para este formato `.basalt`.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next GSQ-RCO Coder Basalt (este) | `.basalt` v2 | IQ1_M (expertos) | 131072 (uso reportado) | Qwen Community License 1.0 | HuggingFace, 0 descargas |
| Qwen3.8-Flash-Next GSQ-RCO Coder GGUF (ISTA-DASLab) | GGUF | IQ1_M | no disponible | Apache-2.0 según el repo de ISTA-DASLab | HuggingFace |
| Pack oficial Basalt IQ3_XXS de Qwen3.8-Flash-Next | `.basalt` v2 | IQ3_XXS | no disponible | Qwen Community License 1.0 | Distribuido con Basalt |

La comparación con otros modelos de la misma categoría (mismo tamaño o misma tarea) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Empaquetado no oficial: no está hecho ni afiliado a Qwen, ISTA-DASLab ni al autor de Basalt; los reclamos de calidad del modelo corresponden a ISTA-DASLab.
- Sin verificación de calidad: el autor no ha ejecutado los quality gates de Basalt sobre este pack.
- Rendimiento no benchmarkeado: la cifra de 150-165 tokens/s proviene de un único usuario y una única máquina.
- Dependencia de versión: requiere Basalt v0.2.0 o compatible; versiones anteriores no leen packs de versión 2.
- Dependencia de perfil: sin el perfil `qwen4exp-48x256.prof` en la ruta correcta, el motor no arranca el pack.
- Cuantización extrema: IQ1_M es una cuantización muy agresiva, con el riesgo de degradación de calidad que ello implica; no se aportan métricas al respecto.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial; debe leerse antes de usar.
- Idiomas soportados: no disponibles en la información proporcionada.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Distribución sin garantía: se ofrece "as is", sin warranty.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wright802/Qwen3.8-Flash-Next-GSQ-RCO-Coder-Basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF de origen (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Motor Basalt: https://github.com/jesdga95/basalt
- Issue de Basalt con discusión sobre el perfil: https://github.com/jesdga95/basalt/issues/209#issuecomment-6613886267
- Proyecto Strata (perfil de expertos): https://github.com/Niko1221/Strata
