# valereseach/vela-sd-turbo-int-v2-vir

## Resumen

Vela PoI v2 (formato VIR) es un contenedor de inferencia determinista del modelo de consenso de la red Vela Core, una blockchain de Proof-of-Inference. No se trata de un modelo generativo nuevo, sino de una representacion en formato VIR (opset 1) del modelo de difusion `stabilityai/sd-turbo` cuantizado a enteros en esquema W8A16, es decir, pesos en int8 y activaciones en int16. El autor, valereseach, publica este fichero de 1,19 GB para que el programa de inferencia sea tratable como datos en lugar de codigo compilado, garantizando que cada byte de salida coincida exactamente con el del fichero `.poisd` usado por los nodos de la red.

La relevancia del modelo es acotada pero tecnica: sirve como referencia de paridad para validar el motor de consenso de Vela y para ejecutar el modelo con el runtime VIR y las herramientas de verificacion. El grafo contiene 903 nodos, 3031 tensores (2126 almacenados) y 424,9 GMAC por inferencia, con un pico de memoria de aproximadamente 1,25 GB. La salida es un latente x0 de 4x64x64 en int16 (Q8), 32768 bytes en total, identico al del `.poisd` de consenso.

El modelo base, sd-turbo, es un modelo de texto a imagen de la familia Stable Diffusion Turbo, disenado para generacion en pocos pasos. Esta version concreta no esta pensada para uso artistico o de produccion general, sino para reproducir de forma verificable la inferencia de la red. La licencia es la Stability AI Community License, con restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (base sd-turbo) exportado como grafo VIR, 903 nodos, 3031 tensores (2126 almacenados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; entrada por tokens de prompt) |
| Tipos de cuantizacion | W8A16 (pesos int8, activaciones int16); latente de salida Q8 int16 |
| Idiomas soportados | no disponible |
| Licencia | Stability AI Community License (license_name: stabilityai-ai-community) |
| Formato de pesos | VIR (opset 1, especificacion `doc/vir-format.md`); fichero `sd-turbo-int.vir` de 1,19 GB |
| Modelo base | stabilityai/sd-turbo (relacion: quantized) |
| Coste computacional | 424,9 GMAC por inferencia |
| Memoria pico | ~1,25 GB |
| Salida | latente x0, 4x64x64 int16 (Q8), 32768 bytes |
| SHA-256 del fichero | `80c548386b613378cd6377319e28c38e8881487551ea6606611ed189381ddf17` |
| Hash de modelo VIR | `4539e064ca8b7197e5c39e86a3e1454b632c62faade38b2ffb13b3875c08e6ad` |

## Arquitectura y entrenamiento

El modelo subyacente es sd-turbo, un modelo de difusion de texto a imagen de la familia Stable Diffusion Turbo orientado a generacion en pocos pasos. Sobre esa base, el autor aplica una cuantizacion entera W8A16 (pesos int8, activaciones int16) y exporta el resultado a un grafo VIR de 903 nodos y 3031 tensores, de los cuales 2126 se almacenan. El fichero incluye el grafo, los pesos int8, las escalas, las tablas y el tokenizador CLIP. No se realiza una recuantizacion adicional durante la exportacion: los mismos tensores del `.poisd` de consenso se introducen en el grafo VIR, de modo que la salida es identica byte a byte.

La innovacion tecnica principal no esta en el entrenamiento, del que la informacion disponible no aporta detalles (no se indican tokens, composicion del dataset ni si hubo RLHF o DPO), sino en la reproducibilidad. El modelo se expresa como datos (VIR, opset 1) en lugar de codigo compilado, lo que permite verificar la paridad de inferencia contra bloques reales de la mainnet. Segun la model card, la salida de `VirModel.run(seed, tokens)` coincide con la del consenso en 51 de 51 bloques muestreados de la mainnet (alturas 2 a 4211), tanto en compilaciones MSVC y GCC como en los kernels escalar y AVX2.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) mediante el modelo base sd-turbo.
- Inferencia determinista: la misma semilla y los mismos tokens producen exactamente la misma salida latente.
- Verificacion de paridad contra bloques de mainnet mediante el runtime VIR y las herramientas de `contrib/vir`.
- Exportacion reproducible desde el fichero de consenso `.poisd` sin recuantizacion.
- Ejecucion en kernels escalar y AVX2, con paridad verificada en compilaciones MSVC y GCC.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion de nodos de Vela: un operador puede ejecutar `check_parity.py` con este fichero para comprobar que su implementacion reproduce la salida de consenso byte a byte antes de unirse a la red.
- Auditoria de inferencia en blockchain: el fichero permite verificar de forma independiente que el latente x0 comprometido en un bloque coincide con el calculado por el modelo de consenso.
- Desarrollo del runtime VIR: sirve como caso de prueba realista de 903 nodos y 424,9 GMAC para probar kernels escalares y AVX2 en distintas toolchains (MSVC, GCC).
- Integracion en pipelines de CI: el fixture de 51 bloques de mainnet permite automatizar pruebas de regresion de paridad en cada cambio del motor de consenso.
- Investigacion sobre Proof-of-Inference: proporciona un ejemplo concreto de como empaquetar un modelo de difusion cuantizado como dato verificable en lugar de codigo.
- Reproduccion de resultados: cualquier tercero puede descargar el `.poisd`, exportarlo a `.vir` con `export_v2.py` y comprobar que el hash del fichego y el hash de modelo coinciden con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de paridad y coste computacional:

| Metrica | Valor |
|---|---|
| Paridad con consenso | 51/51 bloques de mainnet (alturas 2 a 4211) |
| Plataformas verificadas | MSVC y GCC; kernels escalar y AVX2 |
| Coste por inferencia | 424,9 GMAC |
| Memoria pico | ~1,25 GB |
| Tamano del fichero | 1,19 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,25 GB de memoria pico segun la model card, lo que lo situa al alcance de practicamente cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; el requisito de memoria es bajo y el soporte de kernels AVX2 sugiere que la CPU tambien es una opcion viable.
- Cabe en GPU consumer: si, dado el pico de ~1,25 GB; no se detallan modelos concretos.
- Opciones de despliegue: runtime VIR del repositorio de Vela (`contrib/vir/check_parity.py`, `build/bin/test_vela`), y el fichero `.poisd` para nodos de la red. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Vela PoI v2 VIR (este) | no disponible | no disponible | VIR (W8A16) | Stability AI Community License | Inferencia de consenso verificable |
| stabilityai/sd-turbo | no disponible | no disponible | safetensors/diffusers | Stability AI Community License | Texto a imagen en pocos pasos |
| valereseach/vela-sd-turbo-int-v2 (.poisd) | no disponible | no disponible | `.poisd` (consenso) | Stability AI Community License | Ejecucion de nodos Vela |

La comparativa se limita al ecosistema Vela y a su modelo base, ya que la informacion disponible no incluye datos de rendimiento que permitan contrastarlo con otros modelos de difusion de texto a imagen.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta disenado para reproducir la inferencia de consenso de Vela, no para generacion de imagenes de produccion.
- La salida es un latente x0 (4x64x64 int16), no una imagen decodificada; se requiere un decodificador VAE externo para obtener imagenes.
- Licencia restrictiva: Stability AI Community License; el uso comercial exige registro con Stability AI y esta limitado a entidades con ingresos anuales inferiores a 1 millon de USD.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible, aunque heredables del modelo base sd-turbo.
- Limitaciones de idioma: no disponibles.
- La paridad solo se ha verificado en 51 bloques muestreados (alturas 2 a 4211) y en las toolchains MSVC y GCC con kernels escalar y AVX2; otros entornos no estan cubiertos por la verificacion reportada.
- El fichero debe validarse con `sha256sum -c SHA256SUMS` antes de usarse; una descarga corrupta invalida la paridad.
- No se documentan resultados de calidad de imagen ni benchmarks de generacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valereseach/vela-sd-turbo-int-v2-vir
- Repositorio de consenso (.poisd): https://huggingface.co/valereseach/vela-sd-turbo-int-v2
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Sitio de Vela Research: https://velaresearch.ai
- Codigo fuente de Vela: https://git.velaresearch.ai/velaresearch/vela
- Especificacion del formato VIR: `doc/vir-format.md` (dentro del repositorio de Vela)
