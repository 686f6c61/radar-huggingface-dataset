# yjitiu/ComfyUI-Binyuan-Sampler-EN

## Resumen

ComfyUI Binyuan Sampler V6.5 EN (Bilingual) no es un modelo de inteligencia artificial, sino un nodo personalizado (*custom node*) para ComfyUI distribuido a través de HuggingFace por el usuario yjitiu. Se trata de un *sampler* todo en uno que agrupa en un único nodo la secuencia completa de un flujo de difusión: carga del modelo, codificación del *prompt*, muestreo y decodificación de la imagen. El nodo se registra con la clave `BinyuanUltimateSamplerEN` dentro de la categoría `Binyuan` y se presenta como una alternativa a encadenar manualmente los nodos nativos de ComfyUI.

Su característica diferencial es el bilingüismo real: la interfaz muestra etiquetas en inglés o en chino según el idioma configurado en ComfyUI, mediante el sistema oficial de internacionalización (`locales/en|zh/nodeDefs.json`). Además, los valores de los desplegables y los mensajes de error están escritos en ambos idiomas, de modo que siguen siendo legibles aunque la traducción no se aplique. La edición en chino se distribuye por separado con la clave `BinyuanUltimateSampler`, de modo que ambas pueden instalarse en paralelo sin sobrescribirse.

El nodo actúa como orquestador de modelos externos: soporta arquitecturas como Flux, SD3, Wan, Qwen-Image, Krea2, Z-Image, LTXV, Hunyuan y Lumina2 declaradas en el parámetro `CLIP Type`, además de gestión integrada de LoRA y flujos img2img. El repositorio tiene un tamaño de 0,0 GB (solo contiene el código y el ZIP del plugin, no pesos) y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: nodo personalizado de ComfyUI (plugin Python) que orquesta modelos de difusion externos |
| Parametros totales | No disponible: no contiene pesos propios; los aporta el checkpoint o los modelos externos cargados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al nodo; depende del encoder de texto del modelo cargado (en la pila verificada, Qwen3-VL 4B) |
| Tipos de cuantizacion | Precisión de pesos seleccionable: default, fp8, nvfp4, bf16, fp16; soporte de `.gguf` mediante el nodo ComfyUI-GGUF |
| Idiomas soportados | en (interfaz inglesa), zh (interfaz china); mensajes de error y valores de combo bilingues |
| Licencia | MIT |
| Formato de pesos | `.safetensors` para checkpoints (modo Checkpoint) o modelos separados de difusion, CLIP 1/2 y VAE (modo Separate); `.gguf` con ComfyUI-GGUF instalado |
| Categoria de nodo | `Binyuan` |
| Clave del nodo | `BinyuanUltimateSamplerEN` |
| Version | V6.5 |
| Tamano del repositorio | 0,0 GB |
| Entradas relevantes | Load Mode, Diffusion Model, CLIP 1/2, VAE, CLIP Type, Weight Precision, LoRA JSON, Upstream Image 1, Denoise, Chaining Mode, External Model/CLIP/VAE |
| Salidas | IMAGE, MODEL, CLIP, VAE, LATENT, CONDITIONING positivo y negativo, latente sin ruido |
| Fecha de creacion en HuggingFace | 2026-09-16 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no existen datos de entrenamiento, número de tokens, composición de dataset ni fases de RLHF o DPO. El componente es un nodo de Python que se integra en ComfyUI y actúa como envoltorio de conveniencia sobre el *pipeline* estándar de difusión: carga del modelo (checkpoint completo o componentes separados), codificación del *prompt* con el encoder correspondiente, muestreo y decodificación VAE de la latente resultante.

La innovación principal es de ingeniería de integración, no de aprendizaje automático. El parámetro `CLIP Type` abstrae las diferencias de arquitectura entre familias de modelos (Flux, SD3, Wan, Qwen-Image, Krea2, Z-Image, LTXV, Hunyuan, Lumina2), de modo que el usuario no tiene que cambiar de cadena de nodos al cambiar de modelo. Incorpora un gestor de LoRA integrado con panel (`+ Add LoRA`) y una vía alternativa mediante JSON en el campo `LoRA JSON`. Además, implementa un modo de encadenado entre la edición inglesa y la china: conectando las salidas `MODEL`, `CLIP` y `VAE` (salidas 2, 3 y 4) a las entradas `External Model`, `External CLIP` y `External VAE` del otro nodo y fijando `Chaining Mode = Inherit upstream`, el nodo receptor reutiliza el modelo ya cargado sin una segunda carga, lo que reduce el consumo de VRAM.

## Capacidades

- Generación de imagen a partir de texto (txt2img) en una sola pasada de nodo, con cualquier checkpoint compatible con ComfyUI.
- Generación imagen a imagen (img2img): acepta una imagen por `Upstream Image 1` y ajusta la fuerza de transformación mediante `Denoise` (valor usado en la verificación: 0,6).
- Carga en dos modos: `Checkpoint (whole file)` para un único `.safetensors`, o `Separate` para elegir modelo de difusión, `CLIP 1/2` y `VAE` por separado con el `CLIP Type` correspondiente.
- Soporte declarado de arquitecturas Flux, SD3, Wan, Qwen-Image, Krea2, Z-Image, LTXV, Hunyuan y Lumina2 a través del selector de tipo de CLIP.
- Gestión integrada de LoRA: panel interno con `+ Add LoRA` o especificación mediante JSON en el campo `LoRA JSON`.
- Control de precisión de pesos (`default`, `fp8`, `nvfp4`, `bf16`, `fp16`) para ajustar el consumo de VRAM y la velocidad.
- Interfaz bilingüe inglés/chino mediante el sistema oficial de locales de ComfyUI, con valores de combo y mensajes de error también bilingües.
- Encadenado bidireccional con la edición china del nodo, heredando el modelo cargado para ahorrar memoria.
- Salidas múltiples que permiten insertar el nodo en grafos mayores: imagen, modelo, CLIP, VAE, latente, condicionamientos positivo y negativo y latente sin ruido.
- No dispone de capacidades de *tool calling*, agentes, razonamiento multi-paso, visión ni audio: es un componente de generación de imagen.

## Casos de uso

- Flujos txt2img con arquitecturas modernas: un usuario de Flux, SD3 o Krea2 puede montar todo el pipeline en un único nodo y cambiar de arquitectura modificando solo el `CLIP Type`, sin reconstruir el grafo.
- Flujos img2img para retoque o variación: conectando una imagen de entrada y bajando `Denoise` se puede emplear el nodo para variaciones controladas de una imagen existente reutilizando la misma configuración de muestreo.
- Aplicación de estilos mediante LoRA sin salir del nodo: el gestor integrado permite añadir una o varias LoRA por panel o por JSON, útil en pipelines donde el estilo se parametriza externamente y se inyecta como cadena JSON.
- Equipos con perfil mixto inglés/chino: al ofrecer etiquetas, valores de combo y errores en ambos idiomas, un mismo flujo puede ser mantenido por operadores de los dos idiomas sobre la misma instalación de ComfyUI.
- Encadenado de dos instalaciones o dos grafos: cuando se necesita alternar entre la edición inglesa y la china, el modo `Inherit upstream` evita recargar el modelo y reduce el uso de VRAM en máquinas ajustadas.
- Reducción de VRAM en GPUs de gama media: combinando `Weight Precision = fp8` con la carga de modelos separados y el encadenado con herencia, se puede ejecutar en tarjetas con memoria limitada que no admitirían varias copias del modelo.
- Sustitución del `KSampler` nativo en entornos donde este falla: en GPUs de la serie RTX 50 (sm_120) el nodo nativo falla por falta de kernels de xformers, y este plugin sirve como alternativa dentro de la misma instalación.
- Automatización por lotes: al exponer salidas de modelo, CLIP, VAE y latente, el nodo se puede insertar en grafos de procesamiento por lotes que reutilicen los mismos componentes cargados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una prueba de extremo a extremo en hardware concreto, que se reproduce a continuación.

| Prueba | Configuracion | Resultado |
|---|---|---|
| txt2img | krea2_turbo_fp8 + qwen3vl_4b_fp8_scaled, CLIP Type = krea2, krea2RealVae_v10, RTX 5070 Ti, 768x1024, 8 pasos, CFG 1.0 | 20,5 s |
| img2img | Imagen de entrada con denoise 0.6 | Correcto (sin tiempo publicado) |
| LoRA por JSON | Campo `LoRA JSON` | Correcto (sin tiempo publicado) |
| Encadenado ingles a chino | Chaining Mode = Inherit upstream | Correcto |
| Encadenado chino a ingles | Chaining Mode = Inherit upstream | Correcto |

No hay comparación con otros samplers en la información disponible.

## Requisitos de hardware

- El nodo en sí no impone requisitos de VRAM propios: el consumo lo determina el modelo de difusión, el encoder de texto y el VAE cargados.
- Configuración verificada por el autor: RTX 5070 Ti, resolución 768x1024, 8 pasos, CFG 1.0, con krea2_turbo_fp8 como modelo de difusión, qwen3vl_4b_fp8_scaled como encoder y krea2RealVae_v10 como VAE.
- No se publican cifras de VRAM mínima ni recomendada para ninguna cuantización concreta; no disponible.
- GPUs de la serie RTX 50 (sm_120): xformers no dispone de kernels y el nodo falla con el error `No operator found for memory_efficient_attention_forward ... capability (12, 0)`. La solución indicada es lanzar ComfyUI con `--use-pytorch-cross-attention --disable-xformers`. Las RTX 40 y anteriores no se ven afectadas.
- Despliegue: instalación como nodo personalizado de ComfyUI, mediante ZIP en `ComfyUI/custom_nodes/` (opción recomendada) o `git clone` del repositorio directamente en esa carpeta, seguido de reinicio de ComfyUI.
- Para usar modelos `.gguf` se requiere instalar previamente el nodo personalizado `ComfyUI-GGUF`.
- Para los `CLIP Type` `krea2` y `boogu` se necesita ComfyUI core v0.26.2 o superior; en versiones antiguas (v0.24.1, v0.22.2, v0.20.3) algunos tipos no existen y revierten silenciosamente a `stable_diffusion`.
- Latencia medida: 20,5 s para una generación txt2img de 768x1024 en 8 pasos sobre RTX 5070 Ti. No se publican datos de throughput.
- Compatibilidad de despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica, es un plugin de ComfyUI.

## Comparativa con modelos similares

La comparación se establece frente a otros componentes de la misma categoría funcional (nodos de muestreo en ComfyUI), no frente a modelos de IA.

| Componente | Tipo | Idiomas de interfaz | Carga de modelo | LoRA integrado | Chaining con herencia | Licencia |
|---|---|---|---|---|---|---|
| Binyuan Sampler V6.5 EN | Nodo personalizado todo en uno | en, zh (bilingue) | Checkpoint o componentes separados, multiples CLIP Type | Si (panel y JSON) | Si (entre ediciones del nodo) | MIT |
| BinyuanUltimateSampler (edicion china) | Nodo personalizado todo en uno | zh | Misma funcionalidad declarada | Si | Si | MIT |
| KSampler nativo de ComfyUI | Nodo nativo de muestreo | Segun ComfyUI | No carga modelo (recibe MODEL, CLIP, VAE) | No | No | Licencia de ComfyUI |

No se dispone de datos de rendimiento comparativos entre estos componentes en la información proporcionada. Otros nodos todo en uno de la comunidad no aparecen mencionados, por lo que no se comparan.

## Limitaciones y advertencias

- No es un modelo de IA: no genera contenido por sí mismo y no tiene pesos, entrenamiento ni benchmarks propios. Cualquier evaluación de calidad de salida corresponde al modelo subyacente que se cargue.
- Sin datos de adopción: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que implica poca validación externa y ausencia de una comunidad amplia de soporte.
- Repositorio de 0,0 GB: solo contiene el código y el ZIP del plugin; no incluye modelos, que deben obtenerse por separado con sus propias licencias.
- La licencia MIT cubre únicamente el plugin. Las licencias de los checkpoints, LoRA, VAE y encoders utilizados (Flux, Krea2, Qwen-Image, Wan, etc.) son independientes y pueden restringir el uso comercial.
- Dependencia estricta de la versión de ComfyUI: con núcleos anteriores a v0.26.2, los tipos `krea2` y `boogu` no están disponibles y el nodo revierte de forma silenciosa a `stable_diffusion`, lo que puede producir resultados incorrectos sin aviso claro.
- Incompatibilidad conocida con xformers en GPUs sm_120 (serie RTX 50); requiere banderas de arranque específicas y afecta igualmente al KSampler nativo.
- Los modelos `.gguf` requieren la instalación adicional de ComfyUI-GGUF; sin él, el nodo falla con `ComfyUI-GGUF custom node not found`.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje; el riesgo equivalente es la generación de imágenes incoherentes o con artefactos, atribuible al modelo de difusión y a los parámetros de muestreo, no al nodo.
- Sesgos: no disponibles como característica del nodo; dependen del modelo de difusión y del dataset con el que este fue entrenado.
- No hay resultados de benchmarks publicados ni comparativas formales con otros samplers, por lo que las afirmaciones de rendimiento deben tomarse como una única medición en un equipo concreto.
- La fecha de creación registrada en HuggingFace (2026-09-16) figura tal cual en los metadatos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yjitiu/ComfyUI-Binyuan-Sampler-EN
- Repositorio en GitHub: https://github.com/yjitiu/ComfyUI-Binyuan-Sampler-EN
- Ultima release en GitHub: https://github.com/yjitiu/ComfyUI-Binyuan-Sampler-EN/releases/latest
- Paquete ZIP de instalacion: https://huggingface.co/yjitiu/ComfyUI-Binyuan-Sampler-EN/blob/main/binyuan_sampler_plugin_english_v6.5.zip
- ComfyUI (proyecto anfitrion): https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (dependencia opcional para modelos .gguf): https://github.com/city96/ComfyUI-GGUF
